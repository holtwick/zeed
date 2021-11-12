// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { randomBytes } from "crypto"
import { equalBinary } from "./data/bin"

describe("crypto", () => {
  it("should not have collisions", () => {
    expect(equalBinary(new Uint8Array(2), new Uint8Array([0, 0]))).toBe(true)
    let list: Uint8Array[] = Array.apply(null, Array(100)).map(() =>
      randomBytes(8)
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
