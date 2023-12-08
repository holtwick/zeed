// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

/* eslint-disable node/prefer-global/buffer */

import { Uint8ArrayToHexDump, Uint8ArrayToString, equalBinary, fromBase64String, fromHex, joinToUint8Array, stringToUInt8Array, toBase64, toBase64Url, toHex, toUint8Array } from './bin'
import { Uint8ArrayToJson, createArray, fromBase64, jsonToUint8Array } from '.'

describe('bin', () => {
  it('should compare', () => {
    const pingMessage = new Uint8Array([0x9])
    const pongMessage = new Uint8Array([0xA])

    expect(equalBinary(pingMessage, pongMessage)).toBe(false)
    expect(equalBinary(pingMessage, pingMessage)).toBe(true)
  })

  it('should text code', () => {
    const sample = 'Hello → wörld 👨‍👩‍👧‍👦.'
    const encoded = stringToUInt8Array(sample)

    expect(toBase64([1, 2, 3])).toEqual('AQID')
    expect(toHex([1, 2, 254, 255])).toEqual('0102feff')
    expect(fromHex('0102feff')).toMatchInlineSnapshot(`
      Uint8Array [
        1,
        2,
        254,
        255,
      ]
    `)

    expect(toBase64(encoded)).toEqual(
      'SGVsbG8g4oaSIHfDtnJsZCDwn5Go4oCN8J+RqeKAjfCfkafigI3wn5GmLg==',
    )

    expect(toBase64(encoded, true)).toEqual(
      'SGVsbG8g4oaSIHfDtnJsZCDwn5Go4oCN8J+RqeKAjfCfkafigI3wn5GmLg',
    )

    expect(toBase64Url(encoded)).toEqual(
      'SGVsbG8g4oaSIHfDtnJsZCDwn5Go4oCN8J-RqeKAjfCfkafigI3wn5GmLg',
    )

    expect(
      Uint8ArrayToString(
        fromBase64('SGVsbG8g4oaSIHfDtnJsZCDwn5Go4oCN8J-RqeKAjfCfkafigI3wn5GmLg'),
      ),
    ).toBe(sample)

    expect(
      fromBase64('SGVsbG8g4oaSIHfDtnJsZCDwn5Go4oCN8J+RqeKAjfCfkafigI3wn5Gm'),
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
    expect(Uint8ArrayToString(encoded)).not.toEqual(`${sample}a`)
  })

  it('should encode JSON', () => {
    const sample = {
      name: 'Hello → wörld 👨‍👩‍👧‍👦',
      list: [1, false, 'test'],
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

  it('should inline string conversions', () => {
    expect(toUint8Array('abc')).toMatchInlineSnapshot(`
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

  it('should toUint8Array', () => {
    expect(toUint8Array(Buffer.from('abc'))).toMatchInlineSnapshot(`
Uint8Array [
  97,
  98,
  99,
]
`)
    expect(toUint8Array('abc')).toMatchInlineSnapshot(`
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

  it('should join bins', () => {
    const result = joinToUint8Array([new Uint8Array([1, 2, 3]), 'abc'])
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

    const result2 = joinToUint8Array(new Uint8Array([1, 2, 3]), 'abc')
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

  it('should dump', () => {
    const values = createArray(256, i => i)
    const data = new Uint8Array(values)
    const hex = Uint8ArrayToHexDump(data)
    expect(hex).toMatchInlineSnapshot(`
      "0000  00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  ................
      0010  10 11 12 13 14 15 16 17 18 19 1A 1B 1C 1D 1E 1F  ................
      0020  20 21 22 23 24 25 26 27 28 29 2A 2B 2C 2D 2E 2F  .!"#$%&'()*+,-./
      0030  30 31 32 33 34 35 36 37 38 39 3A 3B 3C 3D 3E 3F  0123456789:;<=>?
      0040  40 41 42 43 44 45 46 47 48 49 4A 4B 4C 4D 4E 4F  @ABCDEFGHIJKLMNO
      0050  50 51 52 53 54 55 56 57 58 59 5A 5B 5C 5D 5E 5F  PQRSTUVWXYZ[\\]^_
      0060  60 61 62 63 64 65 66 67 68 69 6A 6B 6C 6D 6E 6F  \`abcdefghijklmno
      0070  70 71 72 73 74 75 76 77 78 79 7A 7B 7C 7D 7E 7F  pqrstuvwxyz{|}~.
      0080  80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F  ................
      0090  90 91 92 93 94 95 96 97 98 99 9A 9B 9C 9D 9E 9F  ................
      00a0  A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE AF  .¡¢£¤¥¦§¨©ª«¬.®¯
      00b0  B0 B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF  °±²³´µ¶·¸¹º»¼½¾¿
      00c0  C0 C1 C2 C3 C4 C5 C6 C7 C8 C9 CA CB CC CD CE CF  ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏ
      00d0  D0 D1 D2 D3 D4 D5 D6 D7 D8 D9 DA DB DC DD DE DF  ÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß
      00e0  E0 E1 E2 E3 E4 E5 E6 E7 E8 E9 EA EB EC ED EE EF  àáâãäåæçèéêëìíîï
      00f0  F0 F1 F2 F3 F4 F5 F6 F7 F8 F9 FA FB FC FD FE FF  ðñòóôõö÷øùúûüýþÿ"
    `)
  })

  it('should base64Url', () => {
    const email = 'example123+my@example.com'
    const b64 = toBase64Url(email)
    expect(b64).toMatchInlineSnapshot('"ZXhhbXBsZTEyMytteUBleGFtcGxlLmNvbQ"')
    const dec = fromBase64String(b64)
    expect(dec).toEqual(email)
  })
})
