import { stringHashFNV1a } from './string-hash-fnv'

describe('strings', () => {
  it('should be identifiable', () => {
    expect(stringHashFNV1a('abc')).toBe(440920331)
    expect(stringHashFNV1a('abcd')).not.toBe(440920331)
  })

  it('should hash 2-byte chars (e.g. ü)', () => {
    expect(stringHashFNV1a('ü')).not.toBe(stringHashFNV1a('u'))
    expect(typeof stringHashFNV1a('ü')).toBe('number')
  })

  it('should hash surrogate pairs (emoji)', () => {
    const emoji = '😀'
    expect(stringHashFNV1a(emoji)).not.toBe(stringHashFNV1a('a'))
    expect(typeof stringHashFNV1a(emoji)).toBe('number')
  })

  it('should hash 3-byte chars (汉)', () => {
    expect(stringHashFNV1a('汉')).not.toBe(stringHashFNV1a('a'))
    expect(typeof stringHashFNV1a('汉')).toBe('number')
  })

  it('should hash empty string', () => {
    expect(stringHashFNV1a('')).toBeGreaterThanOrEqual(0)
  })

  it('should hash long string', () => {
    const long = 'a'.repeat(1000)
    expect(typeof stringHashFNV1a(long)).toBe('number')
  })

  it('should be deterministic', () => {
    const s = 'deterministic'
    expect(stringHashFNV1a(s)).toBe(stringHashFNV1a(s))
  })
})
