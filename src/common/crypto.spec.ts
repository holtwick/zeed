// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { webcrypto } from "crypto"
import { deriveKeyPbkdf2, digest, randomUint8Array } from "./crypto"
import { equalBinary, toHex } from "./data/bin"

if (globalThis.crypto == null) {
  // @ts-ignore
  globalThis.crypto = webcrypto
}

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
  })

  it("should derive key", async () => {
    const key = await deriveKeyPbkdf2("hello")
    expect(key).toMatchInlineSnapshot(`
CryptoKey {
  Symbol(kKeyObject): SecretKeyObject {
    Symbol(kKeyType): "secret",
  },
  Symbol(kAlgorithm): Object {
    "length": 256,
    "name": "AES-GCM",
  },
  Symbol(kExtractable): true,
  Symbol(kKeyUsages): Array [
    "encrypt",
    "decrypt",
  ],
}
`)
  })
})
