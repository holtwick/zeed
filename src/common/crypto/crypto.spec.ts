/* eslint-disable prefer-spread */
/* eslint-disable no-cond-assign */

import { equalBinary, fromBase64, toBase64 } from '../data/bin'
import { DefaultLogger } from '../log/log'
import { decrypt, deriveKeyPbkdf2, digest, encrypt, randomUint8Array } from './crypto'

const log = DefaultLogger('crypto.spec')

describe('crypto', () => {
  it('should not have collisions', () => {
    expect(equalBinary(new Uint8Array(2), new Uint8Array([0, 0]))).toBe(true)
    const list: Uint8Array[] = Array.apply(null, Array.from({ length: 100 })).map(() =>
      randomUint8Array(8),
    )
    let id: Uint8Array | undefined
    while ((id = list.pop())) {
      // console.log(id)
      expect(equalBinary(id, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]))).toBe(false)
      expect(id?.length).toBe(8)
      expect(list).not.toContain(id)
    }
  })

  it('should digest', async () => {
    expect(toBase64(await digest('abc'))).toBe('ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=')
    expect(toBase64(await digest(new Uint8Array([1, 2, 3])))).toMatchInlineSnapshot(`"A5BYxvLAy0ksUzsKTRTvd8wPeKvMztUofYShogEc+4E="`)
  })

  // it("should derive key", async () => {
  //   const key = await deriveKeyPbkdf2("hello")
  //   expect(key).toMatchInlineSnapshot(`
  //     CryptoKey {
  //       Symbol(kKeyObject): SecretKeyObject {
  //         Symbol(kKeyType): "secret",
  //       },
  //       Symbol(kAlgorithm): Object {
  //         "length": 256,
  //         "name": "AES-GCM",
  //       },
  //       Symbol(kExtractable): true,
  //       Symbol(kKeyUsages): Array [
  //         "encrypt",
  //         "decrypt",
  //       ],
  //     }
  //   `)
  // })

  it('should raw crypt', async () => {
    const key = await deriveKeyPbkdf2(new Uint8Array([1, 2, 3]), {
      salt: new Uint8Array([1, 2, 3]),
    })
    const sample = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
    const cipher = await encrypt(sample, key)
    log('cipher', toBase64(cipher))

    const bin = await decrypt(cipher, key)
    expect(equalBinary(sample, bin)).toBe(true)

    const binFix = await decrypt(fromBase64('AQELynGCxvLXKwLM/oHjOaM4R6d7oAzxJpgpCZnKmWwhkwIDzpPMUQ=='), key)
    expect(binFix).toEqual(sample)
  })

  // it("should identify fake decrypt", async () => {
  //   const key = await deriveKeyPbkdf2(new Uint8Array([1, 2, 3]), {
  //     salt: new Uint8Array([1, 2, 3]),
  //   })
  //   await decrypt(new Uint8Array([2, 2]), key)
  //   await expect(async () => {
  //     await decrypt(new Uint8Array([2, 2]), key)
  //   }).rejects.toThrow()
  // })

  // it("should encrypt and decrypt", async () => {
  //   const key = await deriveKey("secret", "room")
  //   const keyAlt = await deriveKey("secretAlt", "room")
  //   let cipher = await encryptJson({ msg: "Hello World" }, key)
  //   let cipherAlt = await encryptJson({ msg: "Hello World" }, keyAlt)
  //   expect(cipher.length).toEqual(57)
  //   expect(cipher).not.toEqual(cipherAlt)
  //   let res = await decryptJson(cipher, key)
  //   expect(res).toEqual({ msg: "Hello World" })
  //   try {
  //     let resAlt = await decryptJson(cipher, keyAlt)
  //     fail()
  //   } catch (err) {}
  //   try {
  //     let resAlt = await decryptJson(cipherAlt, key)
  //     fail()
  //   } catch (err) {}
  // })
})
