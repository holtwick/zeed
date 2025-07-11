import { decodeUtf8, encodeUtf8, fromCamelCase, splice, trimLeft, utf8ByteLength } from './string'

describe('lib0/string', () => {
  it('should trim left', () => {
    expect(trimLeft('   hello')).toBe('hello')
    expect(trimLeft('\thello')).toBe('hello')
    expect(trimLeft('hello')).toBe('hello')
  })

  it('should convert from camel case', () => {
    expect(fromCamelCase('fooBarBaz', '-')).toBe('foo-bar-baz')
    expect(fromCamelCase('FooBar', '_')).toBe('_foo_bar') // implementation adds leading underscore for initial uppercase
    expect(fromCamelCase('foo', '_')).toBe('foo')
  })

  it('should compute utf8 byte length', () => {
    expect(utf8ByteLength('hello')).toBe(5)
    expect(utf8ByteLength('✓')).toBe(3)
    expect(utf8ByteLength('')).toBe(0)
  })

  it('should encode and decode utf8', () => {
    const str = 'hello✓'
    const encoded = encodeUtf8(str)
    expect(Array.isArray(encoded) || encoded instanceof Uint8Array).toBe(true)
    expect(decodeUtf8(encoded)).toBe(str)
  })

  it('should splice strings', () => {
    expect(splice('abcdef', 2, 2, 'XY')).toBe('abXYef')
    expect(splice('abcdef', 0, 3, 'Z')).toBe('Zdef')
    expect(splice('abcdef', 3, 0, 'Q')).toBe('abcQdef')
  })
})
