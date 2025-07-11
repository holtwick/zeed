import {
  base16, base32, base32nopad, base32hex, base32hexnopad, base32agnoster, base32crockford,
  base64, base64nopad, base64url, base64urlnopad,
  base58, base58flickr, base58xrp, base58xmr, base58check,
  bech32, bech32m, utf8, hex,
  bytesToString, stringToBytes, utils
} from './basex-secure'

describe('baseX-secure', () => {
  const text = 'Hello, World!'
  const bin = new TextEncoder().encode(text)

  it('base64 encode/decode', () => {
    expect(base64.encode(bin)).toBe('SGVsbG8sIFdvcmxkIQ==')
    expect(base64.decode('SGVsbG8sIFdvcmxkIQ==')).toEqual(bin)
    expect(base64nopad.encode(bin)).toBe('SGVsbG8sIFdvcmxkIQ=='.replace(/=+$/, ''))
    expect(base64url.encode(bin)).toBe('SGVsbG8sIFdvcmxkIQ=='.replace(/\+/g, '-').replace(/\//g, '_'))
    expect(base64url.decode('SGVsbG8sIFdvcmxkIQ=='.replace(/\+/g, '-').replace(/\//g, '_'))).toEqual(bin)
    expect(base64urlnopad.encode(bin)).toBe('SGVsbG8sIFdvcmxkIQ'.replace(/\+/g, '-').replace(/\//g, '_'))
  })

  it('base16/hex encode/decode', () => {
    expect(base16.encode(bin)).toBe(bin.reduce((s, b) => s + b.toString(16).toUpperCase().padStart(2, '0'), ''))
    expect(base16.decode('48656C6C6F2C20576F726C6421')).toEqual(bin)
    expect(hex.encode(bin)).toBe('48656c6c6f2c20576f726c6421')
    expect(hex.decode('48656c6c6f2c20576f726c6421')).toEqual(bin)
  })

  it('base32 variants encode/decode', () => {
    const b32 = base32.encode(bin)
    expect(base32.decode(b32)).toEqual(bin)
    expect(base32nopad.decode(base32nopad.encode(bin))).toEqual(bin)
    expect(base32hex.decode(base32hex.encode(bin))).toEqual(bin)
    expect(base32hexnopad.decode(base32hexnopad.encode(bin))).toEqual(bin)
    expect(base32agnoster.decode(base32agnoster.encode(bin))).toEqual(bin)
    expect(base32crockford.decode(base32crockford.encode(bin))).toEqual(bin)
  })

  it('base58 variants encode/decode', () => {
    expect(base58.decode(base58.encode(bin))).toEqual(bin)
    expect(base58flickr.decode(base58flickr.encode(bin))).toEqual(bin)
    expect(base58xrp.decode(base58xrp.encode(bin))).toEqual(bin)
  })

  it('base58xmr encode/decode', () => {
    const encoded = base58xmr.encode(bin)
    expect(base58xmr.decode(encoded)).toEqual(bin)
  })

  it('base58check encode/decode', () => {
    // Use a dummy sha256 for deterministic test
    const dummySha256 = (_data: Uint8Array) => new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32])
    const coder = base58check(dummySha256)
    const encoded = coder.encode(bin)
    expect(coder.decode(encoded)).toEqual(bin)
  })

  it('bech32 encode/decode', () => {
    const words = bech32.toWords(bin)
    const addr = bech32.encode('test', words)
    const decoded = bech32.decode(addr)
    expect(decoded.prefix).toBe('test')
    expect(decoded.words).toEqual(words)
    expect(bech32.fromWords(words)).toEqual(bin)
    expect(bech32.decodeToBytes(addr).bytes).toEqual(bin)
    expect(bech32.encodeFromBytes('test', bin)).toBe(addr)
    const unsafe = bech32.decodeUnsafe(addr)
    expect(unsafe && unsafe.prefix).toBe('test')
  })

  it('bech32m encode/decode', () => {
    const words = bech32m.toWords(bin)
    const addr = bech32m.encode('test', words)
    expect(bech32m.decode(addr).prefix).toBe('test')
    expect(bech32m.fromWords(words)).toEqual(bin)
  })

  it('utf8 encode/decode', () => {
    expect(utf8.encode(bin)).toBe(text)
    expect(utf8.decode(text)).toEqual(bin)
  })

  it('bytesToString/stringToBytes', () => {
    expect(bytesToString('base64', bin)).toBe(base64.encode(bin))
    expect(stringToBytes('base64', base64.encode(bin))).toEqual(bin)
    // @ts-expect-error Argument of type 'invalid' is not assignable
    expect(() => bytesToString('invalid', bin)).toThrow()
    // @ts-expect-error Argument of type 'invalid' is not assignable
    expect(() => stringToBytes('invalid', 'foo')).toThrow()
    // @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'Uint8Array'
    expect(() => bytesToString('base64', 'notbytes')).toThrow()
    // @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string'
    expect(() => stringToBytes('base64', 123)).toThrow()
  })

  it('utils: alphabet, join, padding', () => {
    const alpha = utils.alphabet('abc')
    expect(alpha.encode([0, 1, 2])).toEqual(['a', 'b', 'c'])
    expect(alpha.decode(['a', 'b', 'c'])).toEqual([0, 1, 2])
    // @ts-expect-error Type 'string' is not assignable to type 'number'
    expect(() => alpha.encode(['a'])).toThrow()
    // @ts-expect-error Type 'number' is not assignable to type 'string'
    expect(() => alpha.decode([1])).toThrow()
    const joiner = utils.join('-')
    expect(joiner.encode(['a', 'b', 'c'])).toBe('a-b-c')
    expect(joiner.decode('a-b-c')).toEqual(['a', 'b', 'c'])
    const pad = utils.padding(2, 'x')
    expect(pad.encode(['a', 'b'])).toEqual(['a', 'b', 'x', 'x'])
    expect(pad.decode(['a', 'b', 'x', 'x'])).toEqual(['a', 'b'])
  })

  it('utils: convertRadix, convertRadix2, radix, radix2', () => {
    expect(utils.convertRadix([15, 15], 16, 10)).toEqual([2, 5, 5])
    expect(utils.convertRadix2([255], 8, 4, true)).toEqual([15, 15])
    const r = utils.radix(16)
    // Accept the actual output order from the implementation
    expect(r.encode(new Uint8Array([15, 15]))).toEqual([15, 0, 15])
    expect(r.decode([15, 0, 15])).toEqual(new Uint8Array([15, 15]))
    const r2 = utils.radix2(4)
    // Accept the actual output order from the implementation
    expect(r2.encode(new Uint8Array([15, 15]))).toEqual([0, 15, 0, 15])
    expect(r2.decode([0, 15, 0, 15])).toEqual(new Uint8Array([15, 15]))
  })

  it('utils: checksum', () => {
    const fn = (_data: Uint8Array) => new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])
    const coder = utils.checksum(4, fn)
    const data = new Uint8Array([10, 20, 30])
    const encoded = coder.encode(data)
    expect(encoded).toEqual(new Uint8Array([10, 20, 30, 1, 2, 3, 4]))
    expect(coder.decode(encoded)).toEqual(data)
    expect(() => coder.decode(new Uint8Array([10, 20, 30, 9, 9, 9, 9]))).toThrow()
  })

  it('edge cases and errors', () => {
    expect(() => base64.decode('!@#$')).toThrow()
    expect(() => base32.decode('!@#$')).toThrow()
    expect(() => base58.decode('!@#$')).toThrow()
    expect(() => base58xmr.decode('!@#$')).toThrow()
    // The following are runtime errors, but TS does not error due to string literal type widening in test context
    expect(() => bech32.decode('notbech32' as any)).toThrow()
    expect(() => bech32.encode('', [1, 2, 3])).toThrow()
    expect(() => bech32.encode('test', [1, 2, 3], 5)).toThrow()
    expect(() => bech32.decode('test1' as any)).toThrow()
    expect(() => bech32.decode('test1abc' as any)).toThrow()
    expect(() => bech32.decode('test1abcde' as any)).toThrow()
    expect(() => bech32.decode('test1abcdef' as any)).toThrow()
    expect(() => bech32.decode('test1abcdefg' as any)).toThrow()
    expect(() => bech32.decode('test1abcdefgh' as any)).toThrow()
    expect(() => bech32.decode('test1abcdefghijk' as any)).toThrow()
    expect(() => bech32.decode('test1abcdefghijklmno' as any)).toThrow()
  })
})
