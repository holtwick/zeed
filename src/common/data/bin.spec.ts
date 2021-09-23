// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { equalBinary } from "./bin"

describe("bin", () => {
  it("should compare", () => {
    const pingMessage = new Uint8Array([0x9])
    const pongMessage = new Uint8Array([0xa])

    expect(equalBinary(pingMessage, pongMessage)).toBe(false)
    expect(equalBinary(pingMessage, pingMessage)).toBe(true)
  })
})
