export async function hxEncrypt(data: Uint8Array, key: CryptoKey, tag?: Uint8Array): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(12)) // AES-GCM requires a 12-byte IV
  if (!tag) {
    tag = crypto.getRandomValues(new Uint8Array(16))
  }

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
      additionalData: tag,
    },
    key,
    data,
  )

  const encryptedArray = new Uint8Array(encrypted)
  const combined = new Uint8Array(iv.length + encryptedArray.length + tag.length)
  combined.set(iv)
  combined.set(encryptedArray, iv.length)
  combined.set(tag, encryptedArray.length + iv.length)
  return combined
}

export async function hxDecrypt(data: Uint8Array, key: CryptoKey): Promise<Uint8Array> {
  //  The data layout of the combined representation is nonce, ciphertext, then tag.
  //  The nonce is 12 bytes, the tag is 16 bytes, and the ciphertext is the rest of the data.
  const iv = data.slice(0, 12) // nonce is the first 12 bytes
  const encrypted = data.slice(12, -16) // The ciphertext is everything between the nonce and the tag.
  const tag = data.slice(-16) // The authentication tag has a length of 16 bytes.
  // console.log({ iv, encrypted, tag })

  const decrypted = await crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv,
    tagLength: 128,
    additionalData: tag,
  }, key, encrypted)
  return new Uint8Array(decrypted)
}
