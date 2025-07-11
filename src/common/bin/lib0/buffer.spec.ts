import { copyUint8Array, createUint8ArrayFromLen, decodeAny, encodeAny } from './buffer'

describe('lib0/buffer', () => {
  it('should create Uint8Array of given length', () => {
    const arr = createUint8ArrayFromLen(5)
    expect(arr.length).toBe(5)
    expect(arr.every(x => x === 0)).toBe(true)
  })

  it('should copy Uint8Array', () => {
    const arr = new Uint8Array([1, 2, 3])
    const copy = copyUint8Array(arr)
    expect(copy).not.toBe(arr)
    expect(Array.from(copy)).toEqual([1, 2, 3])
  })

  it('should encode and decode any value', () => {
    const obj = { a: 1, b: [2, 3], c: 'str' }
    const bin = encodeAny(obj)
    expect(bin instanceof Uint8Array).toBe(true)
    const decoded = decodeAny(bin)
    expect(decoded).toEqual(obj)
  })
})
