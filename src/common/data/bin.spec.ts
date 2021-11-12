// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { equalBinary, stringToUInt8Array, UInt8ArrayToString } from "./bin"

describe("bin", () => {
  it("should compare", () => {
    const pingMessage = new Uint8Array([0x9])
    const pongMessage = new Uint8Array([0xa])

    expect(equalBinary(pingMessage, pongMessage)).toBe(false)
    expect(equalBinary(pingMessage, pingMessage)).toBe(true)
  })

  it("should text code", () => {
    const sample = "Hello → wörld 👨‍👩‍👧‍👦"
    const encoded = stringToUInt8Array(sample)
    expect(encoded).toMatchInlineSnapshot(`
Uint8Array [
  72,
  101,
  108,
  108,
  111,
  32,
  226,
  134,
  146,
  32,
  119,
  195,
  182,
  114,
  108,
  100,
  32,
  240,
  159,
  145,
  168,
  226,
  128,
  141,
  240,
  159,
  145,
  169,
  226,
  128,
  141,
  240,
  159,
  145,
  167,
  226,
  128,
  141,
  240,
  159,
  145,
  166,
]
`)
    expect(UInt8ArrayToString(encoded)).toEqual(sample)
    expect(UInt8ArrayToString(encoded)).not.toEqual(sample + "a")
  })
})
