// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import {
  equalBinary,
  stringToUInt8Array,
  UInt8ArrayToString,
  toHex,
  toBase64,
} from "./bin"

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

    expect(toBase64([1, 2, 3])).toEqual("AQID")
    expect(toHex([1, 2, 254])).toEqual("0102fe")

    expect(toBase64(encoded)).toEqual(
      "SGVsbG8g4oaSIHfDtnJsZCDwn5Go4oCN8J+RqeKAjfCfkafigI3wn5Gm"
    )

    expect(UInt8ArrayToString(encoded)).toEqual(sample)
    expect(UInt8ArrayToString(encoded)).not.toEqual(sample + "a")
  })
})
