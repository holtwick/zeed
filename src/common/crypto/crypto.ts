import type { BinInput } from '../data/bin-types'
import { ensureUint8Array, equalBinary, toUint8Array } from '../data/bin'

/** Get random bytes using window.crypto if available. Else use a poor fallback solution. */
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
export const CRYPTO_DEFAULT_IV_LENGTH = 12

export async function digest(
  message: BinInput,
  algorithm: AlgorithmIdentifier = CRYPTO_DEFAULT_HASH_ALG,
): Promise<Uint8Array> {
  const m = ensureUint8Array(toUint8Array(message))
  return toUint8Array(
    await crypto.subtle.digest(algorithm, m),
  )
}

export async function deriveKeyPbkdf2(
  secret: BinInput,
  opt: {
    iterations?: number
    salt?: BinInput
  } = {},
): Promise<CryptoKey> {
  const secretBuffer = ensureUint8Array(toUint8Array(secret))
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
      salt: opt.salt ? ensureUint8Array(toUint8Array(opt.salt)) : new Uint8Array(0),
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

export async function deriveKeyPbkdf2CBC(
  secret: BinInput,
  opt: {
    iterations?: number
    salt?: BinInput
  } = {},
): Promise<CryptoKey> {
  const secretBuffer = ensureUint8Array(toUint8Array(secret))
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
      salt: opt.salt ? ensureUint8Array(toUint8Array(opt.salt)) : new Uint8Array(0),
      iterations: opt.iterations ?? CRYPTO_DEFAULT_DERIVE_ITERATIONS,
      hash: CRYPTO_DEFAULT_HASH_ALG,
    },
    keyMaterial,
    {
      name: 'AES-CBC',
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
  const iv = randomUint8Array(CRYPTO_DEFAULT_IV_LENGTH)
  const cipher = await crypto.subtle.encrypt(
    { name: CRYPTO_DEFAULT_ALG, iv: ensureUint8Array(iv) },
    key,
    ensureUint8Array(data),
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
  const magic = ensureUint8Array(data.subarray(0, 2))
  if (!equalBinary(magic, getMagicId()))
    return Promise.reject(new Error(`Unknown magic ${magic}`))

  const iv = ensureUint8Array(data.subarray(2, 2 + CRYPTO_DEFAULT_IV_LENGTH))
  const cipher = ensureUint8Array(data.subarray(2 + CRYPTO_DEFAULT_IV_LENGTH, data.length))
  const plain = await crypto.subtle.decrypt(
    { name: CRYPTO_DEFAULT_ALG, iv },
    key,
    cipher,
  )
  return new Uint8Array(plain)
}
