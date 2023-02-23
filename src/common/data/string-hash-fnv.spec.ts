import { stringHashFNV1a } from './string-hash-fnv'

describe('Strings', () => {

  it('should be identifiable', () => {
    expect(stringHashFNV1a('abc')).toBe(440920331)
    expect(stringHashFNV1a('abcd')).not.toBe(440920331)
  })

})
