// Original at https://github.com/dchest/xaes MIT License as of 2024-07-02
// More at https://words.filippo.io/dispatches/xaes-256-gcm/

/**
 * Implementation of XAES-256-GCM as defined in https://c2sp.org/XAES-256-GCM
 * based on the Web Cryptography API (https://www.w3.org/TR/WebCryptoAPI/).
 *
 * It uses a 256-bit AES-CBC CryptoKey and a 192-bit nonce to derive
 * a 256-bit key and a 96-bit nonce for AES-GCM.
 *
 * Due to the use of the standard CryptoKey and Web Cryptography API operations,
 * this implementation is fully compatible with other parts of the Web Cryptography API.
 * For example, keys can be stored in IndexedDB and be non-extractable. The only
 * additional requirement is that the key must have 'encrypt' usage even for decryption,
 * however, there's no real distinction between encryption and decryption operations
 * for AES-GCM anyway (you can simulate decryption by encrypting the ciphertext).
 */

/**
 * Generates an AES block using the given key and data xored with the given xor.
 */
async function aesBlock(key: CryptoKey, data: BufferSource, xor: BufferSource): Promise<Uint8Array> {
  const block = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: xor },
    key,
    data,
  )
  return new Uint8Array(block, 0, 16)
}

/**
 * Derives a half key.
 */
async function halfKey(index: number, key: CryptoKey, iv: Uint8Array, k1: Uint8Array): Promise<Uint8Array> {
  const m = new Uint8Array(16)
  m[1] = index
  m[2] = 0x58 // 'X'
  m.set(iv.subarray(0, 12), 4)
  return await aesBlock(key, m, k1)
}

/**
 * Derives a 256-bit key and 96-bit nonce from the given 256-bit key and a 192-bit nonce.
 *
 * @param {CryptoKey} key
 * @param {BufferSource} iv
 * @returns {Promise<{key: CryptoKey, iv: Uint8Array}>}
 */
async function deriveKeyNonce(key: CryptoKey, iv: BufferSource): Promise<{ key: CryptoKey, iv: Uint8Array }> {
  if (key.algorithm.name !== 'AES-CBC') {
    throw new Error('key must be for AES-CBC')
  }
  if (!key.usages.includes('encrypt')) {
    throw new Error('key must have \'encrypt\' usage')
  }
  // @ts-expect-error todo
  if (key.algorithm.length !== 256) {
    throw new Error('key must be 256 bits')
  }
  if (iv == null || iv.byteLength !== 24) {
    throw new Error('iv must be 24 bytes')
  }
  const ivBytes = ArrayBuffer.isView(iv)
    ? new Uint8Array(iv.buffer, iv.byteOffset, iv.byteLength)
    : new Uint8Array(iv)
  const k1 = await aesBlock(key, new Uint8Array(16), new Uint8Array(16))

  let msb = 0
  for (let i = k1.length - 1; i >= 0; i--) {
    [msb, k1[i]] = [(k1[i] >>> 7) & 0xFF, ((k1[i] << 1) | msb) & 0xFF]
  }
  k1[k1.length - 1] ^= (msb * 0b10000111) & 0xFF

  const kxBytes = new Uint8Array(32)
  kxBytes.set(await halfKey(0x01, key, ivBytes, k1), 0)
  kxBytes.set(await halfKey(0x02, key, ivBytes, k1), 16)

  const kx = await crypto.subtle.importKey(
    'raw',
    kxBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    [...key.usages],
  )
  return {
    key: kx,
    iv: ivBytes.subarray(12),
  }
}
/**
 * Encrypts data using XAES-256-GCM with the given key and iv.
 * Key must be a 256-bit AES-CBC CryptoKey with 'encrypt' usage.
 *
 * @param {{iv: BufferSource, additionalData?: BufferSource}} params
 *          - encryption parameters, containing the 24-byte iv (nonce)
 *            and optional additional data to authenticate.
 * @param {CryptoKey} key - 256-bit AES-CBC CryptoKey.
 * @param {BufferSource} data - Data to encrypt.
 * @returns {Promise<ArrayBuffer>} - Encrypted data.
 */
export async function encrypt(params: {
  iv: BufferSource
  additionalData?: BufferSource
}, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer> {
  const derived = await deriveKeyNonce(key, params.iv)
  return await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: derived.iv,
      tagLength: 128,
      additionalData: params.additionalData ?? new Uint8Array(),
    },
    derived.key,
    data,
  )
}

/**
 * Decrypts data using XAES-256-GCM with the given key and iv.
 * Key must be a 256-bit AES-CBC CryptoKey with 'encrypt' and 'decrypt' usages.
 *
 * @param {{iv: BufferSource, additionalData?: BufferSource}} params
 *           - decryption parameters, containing the 24-byte iv (nonce)
 *             and optional additional data to authenticate.
 * @param {CryptoKey} key - 256-bit AES-CBC CryptoKey.
 * @param {BufferSource} data - Data to decrypt.
 * @returns {Promise<ArrayBuffer>} - Decrypted data.
 */
export async function decrypt(params: {
  iv: BufferSource
  additionalData?: BufferSource
}, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer> {
  const derived = await deriveKeyNonce(key, params.iv)
  return await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: derived.iv,
      tagLength: 128,
      additionalData: params.additionalData ?? new Uint8Array(),
    },
    derived.key,
    data,
  )
}

/**
 * Generate a random key suitable for XAES-256-GCM.
 * The actual key is an AES-CBC CryptoKey with 256-bit length.
 *
 * This function is not necessary, as you can use crypto.subtle.generateKey with AES-CBC directly.
 *
 * @param {boolean} extractable
 * @returns Promise<CryptoKey>
 */
export async function generateKey(extractable?: boolean): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-CBC',
      // @ts-expect-error todo
      length: 256,
    },
    extractable,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Import a key suitable for XAES-256-GCM.
 * The actual key must be an AES-CBC CryptoKey with 256-bit length.
 *
 * This function is not necessary, as you can use crypto.subtle.importKey with AES-CBC directly.
 *
 * @param {"jwk" | "raw" | "pkcs8" | "spki"} format
 * @param {BufferSource | JsonWebKey} keyData
 * @param {boolean} extractable
 * @returns {Promise<CryptoKey>}
 */
export async function importKey(format: 'jwk' | 'raw' | 'pkcs8' | 'spki', keyData: BufferSource | JsonWebKey, extractable?: boolean): Promise<CryptoKey> {
  return await crypto.subtle.importKey( // @ts-expect-error-next-line
    format,
    keyData,
    { name: 'AES-CBC', length: 256 },
    extractable,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Export a key.
 * The resulting export will have AES-CBC algorithm specified.
 *
 * This function is not necessary, as you can use crypto.subtle.exportKey directly.
 *
 * @param {"jwk" | "pkcs8" | "raw" | "spki"} format
 * @param {CryptoKey} key
 * @returns {Promise<ArrayBuffer | JsonWebKey>}
 */
export async function exportKey(format: 'jwk' | 'pkcs8' | 'raw' | 'spki', key: CryptoKey): Promise<ArrayBuffer | JsonWebKey> {
  return await crypto.subtle.exportKey(format, key)
}
