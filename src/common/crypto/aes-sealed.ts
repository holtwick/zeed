const tagLength = 128
const authenticating_default = new Uint8Array()

export async function hxEncrypt(data: Uint8Array, key: CryptoKey, authenticating: Uint8Array = authenticating_default): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(12)) // AES-GCM requires a 12-byte IV
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength,
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

export async function hxDecrypt(data: Uint8Array, key: CryptoKey, authenticating: Uint8Array = authenticating_default): Promise<Uint8Array> {
  const iv = data.slice(0, 12) // nonce is the first 12 bytes
  const encrypted = data.slice(12) // ciphertext and tag of 128 bits
  const decrypted = await crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv,
    tagLength,
    additionalData: authenticating,
  }, key, encrypted)
  return new Uint8Array(decrypted)
}
