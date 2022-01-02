import { CryptoEncoder, JsonEncoder } from "."
import { deriveKeyPbkdf2, randomUint8Array } from ".."
import { webcrypto } from "crypto"

// @ts-ignore
globalThis.crypto = webcrypto

describe("encoder", () => {
  it("should encode json", async () => {
    const sample = {
      name: "Hello → wörld 👨‍👩‍👧‍👦",
      list: [1, false, "test"],
      num: 1,
    }
    const encoder = new JsonEncoder()
    const enc = await encoder.encode(sample)
    const back = await encoder.decode(enc)
    expect(back).toEqual(sample)
  })

  it("should encode crypto", async () => {
    const sample = {
      name: "Hello → wörld 👨‍👩‍👧‍👦",
      list: [1, false, "test"],
      num: 1,
    }
    const key = await deriveKeyPbkdf2(randomUint8Array(20))
    const encoder = new CryptoEncoder(key)
    const enc = await encoder.encode(sample)
    expect(enc).not.toEqual(sample)
    const back = await encoder.decode(enc)
    expect(back).toEqual(sample)
  })
})
