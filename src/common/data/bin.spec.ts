// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { fromBase64, jsonToUint8Array, Uint8ArrayToJson } from "."
import {
  equalBinary,
  stringToUInt8Array,
  Uint8ArrayToString,
  toHex,
  toBase64,
  toUint8Array,
  joinToUint8Array,
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

    expect(
      Uint8ArrayToString(
        fromBase64("SGVsbG8g4oaSIHfDtnJsZCDwn5Go4oCN8J+RqeKAjfCfkafigI3wn5Gm")
      )
    ).toBe(sample)

    expect(
      fromBase64("SGVsbG8g4oaSIHfDtnJsZCDwn5Go4oCN8J+RqeKAjfCfkafigI3wn5Gm")
    ).toMatchInlineSnapshot(`
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

    expect(Uint8ArrayToString(encoded)).toEqual(sample)
    expect(Uint8ArrayToString(encoded)).not.toEqual(sample + "a")
  })

  it("should encode JSON", () => {
    const sample = {
      name: "Hello → wörld 👨‍👩‍👧‍👦",
      list: [1, false, "test"],
      num: 1,
    }
    const bin = jsonToUint8Array(sample)
    expect(bin).toMatchInlineSnapshot(`
Uint8Array [
  123,
  34,
  110,
  97,
  109,
  101,
  34,
  58,
  34,
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
  34,
  44,
  34,
  108,
  105,
  115,
  116,
  34,
  58,
  91,
  49,
  44,
  102,
  97,
  108,
  115,
  101,
  44,
  34,
  116,
  101,
  115,
  116,
  34,
  93,
  44,
  34,
  110,
  117,
  109,
  34,
  58,
  49,
  125,
]
`)
    const back = Uint8ArrayToJson(bin)
    expect(back).toEqual(sample)
  })

  it("should inline string conversions", () => {
    expect(toUint8Array("abc")).toMatchInlineSnapshot(`
Uint8Array [
  97,
  98,
  99,
]
`)
    expect(new Uint8Array([1, 2, 3])).toMatchInlineSnapshot(`
Uint8Array [
  1,
  2,
  3,
]
`)
  })

  it("should toUint8Array", () => {
    expect(toUint8Array(Buffer.from("abc"))).toMatchInlineSnapshot(`
Uint8Array [
  97,
  98,
  99,
]
`)
    expect(toUint8Array("abc")).toMatchInlineSnapshot(`
Uint8Array [
  97,
  98,
  99,
]
`)
    expect(toUint8Array([1, 2, 3])).toMatchInlineSnapshot(`
Uint8Array [
  1,
  2,
  3,
]
`)
  })

  it("should join bins", () => {
    let result = joinToUint8Array([new Uint8Array([1, 2, 3]), "abc"])
    expect(result).toMatchInlineSnapshot(`
      Uint8Array [
        1,
        2,
        3,
        97,
        98,
        99,
      ]
    `)

    let result2 = joinToUint8Array(new Uint8Array([1, 2, 3]), "abc")
    expect(result2).toMatchInlineSnapshot(`
      Uint8Array [
        1,
        2,
        3,
        97,
        98,
        99,
      ]
    `)
  })
})
