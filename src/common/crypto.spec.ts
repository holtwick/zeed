// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { webcrypto } from "crypto"
import { randomUint8Array } from "./crypto"
import { equalBinary } from "./data/bin"

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
})
