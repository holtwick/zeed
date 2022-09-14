import { BinInput, equalBinary, toUint8Array } from "./data/bin"

// todo: should fallback to node crypto
export function randomUint8Array(length: number = 16): Uint8Array {
  let randomBytes = new Uint8Array(length)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes)
  } else {
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

const DEFAULT_HASH_ALG = "SHA-256"
const DEFAULT_CRYPTO_ALG = "AES-GCM"
const DEFAULT_DERIVE_ALG = "PBKDF2"

export async function digest(
  message: BinInput,
  algorithm: AlgorithmIdentifier = DEFAULT_HASH_ALG
): Promise<Uint8Array> {
  return toUint8Array(
    await crypto.subtle.digest(algorithm, toUint8Array(message))
  )
}

export async function deriveKeyPbkdf2(
  secret: BinInput,
  opt: {
    iterations?: number
    salt?: BinInput
  } = {}
): Promise<CryptoKey> {
  const secretBuffer = toUint8Array(secret)
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    secretBuffer,
    DEFAULT_DERIVE_ALG,
    false,
    ["deriveKey"]
  )
  return await crypto.subtle.deriveKey(
    {
      name: DEFAULT_DERIVE_ALG,
      salt: opt.salt ? toUint8Array(opt.salt) : new Uint8Array(0),
      iterations: opt.iterations ?? 100000,
      hash: DEFAULT_HASH_ALG,
    },
    keyMaterial,
    {
      name: DEFAULT_CRYPTO_ALG,
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  )
}

const MAGIC_ID = new Uint8Array([1, 1])

export async function encrypt(
  data: Uint8Array,
  key: CryptoKey
): Promise<Uint8Array> {
  const iv = randomUint8Array(12)
  const cipher = await crypto.subtle.encrypt(
    { name: DEFAULT_CRYPTO_ALG, iv },
    key,
    data
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
  key: CryptoKey
): Promise<Uint8Array> {
  let magic = data.subarray(0, 2)
  if (!equalBinary(magic, MAGIC_ID)) {
    return Promise.reject(`Unknown magic ${magic}`)
  }
  let iv = data.subarray(2, 2 + 12)
  let cipher = data.subarray(2 + 12, data.length)
  const plain = await crypto.subtle.decrypt(
    { name: DEFAULT_CRYPTO_ALG, iv },
    key,
    cipher
  )
  return new Uint8Array(plain)
}
