import type { BinInput } from './data/bin'
import { equalBinary, toUint8Array } from './data/bin'

/**
 * Get random bytes using window.crypto if available. Else use a poor fallback solution.
 * @param length
 */
export function randomUint8Array(length = 16): Uint8Array {
  const randomBytes = new Uint8Array(length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes)
  }
  else {
    // hack: not state of the art secure
    // throw "crypto.getRandomValues is required"
    for (let i = 0; i < length; i++) {
      // Math.random: "...range 0 to less than 1 (inclusive of 0, but not 1)"
      // 0.9... * 0xff < 255 therefore * 0x100
      randomBytes[i] = Math.floor(Math.random() * 0x100) // 0...255
    }
  }
  return randomBytes
}

export const CRYPTO_DEFAULT_HASH_ALG = 'SHA-256'
export const CRYPTO_DEFAULT_ALG = 'AES-GCM'
export const CRYPTO_DEFAULT_DERIVE_ALG = 'PBKDF2'
export const CRYPTO_DEFAULT_DERIVE_ITERATIONS = 100000

export async function digest(
  message: BinInput,
  algorithm: AlgorithmIdentifier = CRYPTO_DEFAULT_HASH_ALG,
): Promise<Uint8Array> {
  return toUint8Array(
    await crypto.subtle.digest(algorithm, toUint8Array(message)),
  )
}

export async function deriveKeyPbkdf2(
  secret: BinInput,
  opt: {
    iterations?: number
    salt?: BinInput
  } = {},
): Promise<CryptoKey> {
  const secretBuffer = toUint8Array(secret)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    secretBuffer,
    CRYPTO_DEFAULT_DERIVE_ALG,
    false,
    ['deriveKey'],
  )
  return await crypto.subtle.deriveKey(
    {
      name: CRYPTO_DEFAULT_DERIVE_ALG,
      salt: opt.salt ? toUint8Array(opt.salt) : new Uint8Array(0),
      iterations: opt.iterations ?? CRYPTO_DEFAULT_DERIVE_ITERATIONS,
      hash: CRYPTO_DEFAULT_HASH_ALG,
    },
    keyMaterial,
    {
      name: CRYPTO_DEFAULT_ALG,
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  )
}

function getMagicId() {
  return new Uint8Array([1, 1])
}

export async function encrypt(
  data: Uint8Array,
  key: CryptoKey,
): Promise<Uint8Array> {
  const MAGIC_ID = getMagicId()
  const iv = randomUint8Array(12)
  const cipher = await crypto.subtle.encrypt(
    { name: CRYPTO_DEFAULT_ALG, iv },
    key,
    data,
  )
  const binCypher = new Uint8Array(cipher)
  const bufferLength = MAGIC_ID.length + iv.length + binCypher.length
  const buffer = new Uint8Array(bufferLength)
  let pos = 0
  buffer.set(MAGIC_ID, pos)
  pos += MAGIC_ID.length
  buffer.set(iv, pos)
  pos += iv.length
  buffer.set(binCypher, pos)
  return buffer
}

export async function decrypt(
  data: Uint8Array,
  key: CryptoKey,
): Promise<Uint8Array> {
  const magic = data.subarray(0, 2)
  if (!equalBinary(magic, getMagicId()))
    return Promise.reject(new Error(`Unknown magic ${magic}`))

  const iv = data.subarray(2, 2 + 12)
  const cipher = data.subarray(2 + 12, data.length)
  const plain = await crypto.subtle.decrypt(
    { name: CRYPTO_DEFAULT_ALG, iv },
    key,
    cipher,
  )
  return new Uint8Array(plain)
}
