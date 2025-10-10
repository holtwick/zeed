import type { BinArray } from '../data/bin-types'
import { ensureUint8Array } from '../data/bin'

const AES_GCM_TAG_LENGTH_BITS = 128

export async function encryptAesGcm(data: BinArray, key: CryptoKey, authenticating: BinArray = new Uint8Array()): Promise<BinArray> {
  const iv = crypto.getRandomValues(new Uint8Array(12)) // AES-GCM requires a 12-byte IV
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: AES_GCM_TAG_LENGTH_BITS,
      additionalData: authenticating,
    },
    key,
    data,
  )

  const encryptedArray = new Uint8Array(encrypted)
  const combined = new Uint8Array(iv.length + encryptedArray.length)
  combined.set(iv)
  combined.set(encryptedArray, iv.length)
  return combined
}

export async function decryptAesGcm(data: BinArray, key: CryptoKey, authenticating: Uint8Array = new Uint8Array()): Promise<Uint8Array> {
  const iv = ensureUint8Array(data.slice(0, 12)) // nonce is the first 12 bytes
  const encrypted = ensureUint8Array(data.slice(12)) // ciphertext and tag of 128 bits
  const decrypted = await crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv,
    tagLength: AES_GCM_TAG_LENGTH_BITS,
    additionalData: ensureUint8Array(authenticating),
  }, key, encrypted)
  return new Uint8Array(decrypted)
}
