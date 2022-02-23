// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { webcrypto } from "crypto"
import { Logger } from "."
import {
  decrypt,
  deriveKeyPbkdf2,
  digest,
  encrypt,
  randomUint8Array,
} from "./crypto"
import { equalBinary, toHex } from "./data/bin"

if (globalThis.crypto == null) {
  // @ts-ignore
  globalThis.crypto = webcrypto
}

const log = Logger("crypto.spec")

describe("crypto", () => {
  it("should not have collisions", () => {
    expect(equalBinary(new Uint8Array(2), new Uint8Array([0, 0]))).toBe(true)
    let list: Uint8Array[] = Array.apply(null, Array(100)).map(() =>
      randomUint8Array(8)
    )
    let id: Uint8Array | undefined
    while ((id = list.pop())) {
      // console.log(id)
      expect(equalBinary(id, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]))).toBe(
        false
      )
      expect(id?.length).toBe(8)
      expect(list).not.toContain(id)
    }
  })

  it("should digest", async () => {
    expect(toHex(await digest("abc"))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    )
    expect(await digest(new Uint8Array([1, 2, 3]))).toMatchInlineSnapshot(`
Uint8Array [
  3,
  144,
  88,
  198,
  242,
  192,
  203,
  73,
  44,
  83,
  59,
  10,
  77,
  20,
  239,
  119,
  204,
  15,
  120,
  171,
  204,
  206,
  213,
  40,
  125,
  132,
  161,
  162,
  1,
  28,
  251,
  129,
]
`)
  })

  it("should derive key", async () => {
    const key = await deriveKeyPbkdf2("hello")
    expect(key).toMatchInlineSnapshot(`
      CryptoKey {
        Symbol(kKeyObject): SecretKeyObject {
          Symbol(kKeyType): "secret",
        },
        Symbol(kAlgorithm): {
          "length": 256,
          "name": "AES-GCM",
        },
        Symbol(kExtractable): true,
        Symbol(kKeyUsages): [
          "encrypt",
          "decrypt",
        ],
      }
    `)
  })

  it("should raw crypt", async () => {
    const key = await deriveKeyPbkdf2(new Uint8Array([1, 2, 3]), {
      salt: new Uint8Array([1, 2, 3]),
    })
    const sample = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
    const cipher = await encrypt(sample, key)
    // log("cipher", cipher)

    const bin = await decrypt(cipher, key)
    expect(equalBinary(sample, bin)).toBe(true)

    const binFix = await decrypt(
      new Uint8Array([
        1, 1, 27, 108, 252, 31, 238, 192, 61, 168, 45, 29, 128, 212, 215, 222,
        205, 105, 178, 193, 150, 36, 24, 216, 180, 75, 168, 133, 37, 25, 124,
        137, 221, 103, 214, 97, 218, 232, 248, 93,
      ]),
      key
    )
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
