import { createUint8ArrayFromArrayBuffer, createUint8ArrayViewFromArrayBuffer } from './create'

describe('lib0/create', () => {
  it('should create Uint8Array view from ArrayBuffer', () => {
    const buf = new ArrayBuffer(10)
    const arr = createUint8ArrayViewFromArrayBuffer(buf, 2, 5)
    expect(arr.byteOffset).toBe(2)
    expect(arr.length).toBe(5)
  })

  it('should create Uint8Array from ArrayBuffer', () => {
    const buf = new ArrayBuffer(8)
    const arr = createUint8ArrayFromArrayBuffer(buf)
    expect(arr.byteOffset).toBe(0)
    expect(arr.length).toBe(8)
  })
})
