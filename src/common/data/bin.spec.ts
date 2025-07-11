import { Uint8ArrayToHexDump, Uint8ArrayToString, equalBinary, fromBase64String, fromHex, joinToUint8Array, stringToUInt8Array, toBase64, toBase64Url, toHex, toUint8Array, _encodeUtf8Polyfill, _decodeUtf8Polyfill } from './bin'
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
    //     expect(toUint8Array(Buffer.from('abc'))).toMatchInlineSnapshot(`
    // Uint8Array [
    //   97,
    //   98,
    //   99,
    // ]
    // `)
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
      "0000  00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f  ................
      0010  10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f  ................
      0020  20 21 22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f  .!"#$%&'()*+,-./
      0030  30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f  0123456789:;<=>?
      0040  40 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 4f  @ABCDEFGHIJKLMNO
      0050  50 51 52 53 54 55 56 57 58 59 5a 5b 5c 5d 5e 5f  PQRSTUVWXYZ[\\]^_
      0060  60 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f  \`abcdefghijklmno
      0070  70 71 72 73 74 75 76 77 78 79 7a 7b 7c 7d 7e 7f  pqrstuvwxyz{|}~.
      0080  80 81 82 83 84 85 86 87 88 89 8a 8b 8c 8d 8e 8f  ................
      0090  90 91 92 93 94 95 96 97 98 99 9a 9b 9c 9d 9e 9f  ................
      00a0  a0 a1 a2 a3 a4 a5 a6 a7 a8 a9 aa ab ac ad ae af  .¡¢£¤¥¦§¨©ª«¬.®¯
      00b0  b0 b1 b2 b3 b4 b5 b6 b7 b8 b9 ba bb bc bd be bf  °±²³´µ¶·¸¹º»¼½¾¿
      00c0  c0 c1 c2 c3 c4 c5 c6 c7 c8 c9 ca cb cc cd ce cf  ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏ
      00d0  d0 d1 d2 d3 d4 d5 d6 d7 d8 d9 da db dc dd de df  ÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß
      00e0  e0 e1 e2 e3 e4 e5 e6 e7 e8 e9 ea eb ec ed ee ef  àáâãäåæçèéêëìíîï
      00f0  f0 f1 f2 f3 f4 f5 f6 f7 f8 f9 fa fb fc fd fe ff  ðñòóôõö÷øùúûüýþÿ"
    `)
  })

  it('should base64Url', () => {
    const email = 'example123+my@example.com'
    const b64 = toBase64Url(email)
    expect(b64).toMatchInlineSnapshot('"ZXhhbXBsZTEyMytteUBleGFtcGxlLmNvbQ"')
    const dec = fromBase64String(b64)
    expect(dec).toEqual(email)
  })

  it('should test polyfill functions directly', () => {
    const text = 'Hello wörld 👋'

    // Test UTF8 polyfill encoding
    const encoded = _encodeUtf8Polyfill(text)
    expect(encoded).toBeInstanceOf(Uint8Array)
    expect(encoded.length).toBeGreaterThan(text.length) // Unicode chars take more bytes

    // Test UTF8 polyfill decoding
    const decoded = _decodeUtf8Polyfill(encoded)
    expect(decoded).toBe(text)
  })

  it('should test polyfill with long strings', () => {
    // Test the chunking logic in _decodeUtf8Polyfill (>10000 chars)
    const longText = 'x'.repeat(15000)
    const encoded = _encodeUtf8Polyfill(longText)
    const decoded = _decodeUtf8Polyfill(encoded)
    expect(decoded).toBe(longText)
  })

  it('should test ArrayBuffer conversion', () => {
    const buffer = new ArrayBuffer(4)
    const view = new Uint8Array(buffer)
    view[0] = 1
    view[1] = 2
    view[2] = 3
    view[3] = 4

    const result = toUint8Array(buffer)
    expect(result).toEqual(new Uint8Array([1, 2, 3, 4]))
  })

  it('should test hex dump with different input types', () => {
    // Test with string input
    const stringResult = Uint8ArrayToHexDump('ABC')
    expect(stringResult).toContain('0000')
    expect(stringResult).toContain('ABC')

    // Test with ArrayBuffer input
    const buffer = new ArrayBuffer(3)
    const view = new Uint8Array(buffer)
    view[0] = 65 // 'A'
    view[1] = 66 // 'B' 
    view[2] = 67 // 'C'
    const bufferResult = Uint8ArrayToHexDump(buffer)
    expect(bufferResult).toContain('0000')
    expect(bufferResult).toContain('ABC')

    // Test with Array input
    const arrayResult = Uint8ArrayToHexDump([65, 66, 67])
    expect(arrayResult).toContain('0000')
    expect(arrayResult).toContain('ABC')

    // Test with Uint8Array input
    const uint8Result = Uint8ArrayToHexDump(new Uint8Array([65, 66, 67]))
    expect(uint8Result).toContain('0000')
    expect(uint8Result).toContain('ABC')

    // Test with unknown input type (should return false)
    const unknownResult = Uint8ArrayToHexDump({ invalid: 'type' } as any)
    expect(unknownResult).toBe(false)
  })

  it('should test hex dump with custom block size', () => {
    const data = new Uint8Array(20).fill(65) // 20 'A's
    const result = Uint8ArrayToHexDump(data, 8) // Custom block size of 8
    expect(result).toContain('0000')
    expect(result).toContain('0008') // Second line should start at offset 8
    expect(result).toContain('0010') // Third line should start at offset 16
  })

  it('should test hex dump character replacement', () => {
    // Test with control characters that should be replaced with '.'
    const controlChars = new Uint8Array([0, 1, 31, 32, 127, 160, 173])
    const result = Uint8ArrayToHexDump(controlChars)
    expect(result).toContain('.')
    expect(result).toContain(' ') // Space (32) should remain as space
  })

  it('should test hex dump padding for partial blocks', () => {
    // Test with data that doesn't fill a complete block
    const partialData = new Uint8Array([65, 66]) // Only 2 bytes
    const result = Uint8ArrayToHexDump(partialData)
    expect(result).toContain('0000')
    expect(result).toContain('AB')
    // Should contain padding spaces for the rest of the 16-byte block
    expect(result).toMatch(/AB\s+/)
  })
})