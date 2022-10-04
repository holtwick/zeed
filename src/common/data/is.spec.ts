// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { isUint8Array } from './is'

describe('is', () => {
  it('should identify Uint8Array', () => {
    expect(isUint8Array(new Uint8Array([1, 2, 3]))).toBe(true)
    expect(isUint8Array(new Uint16Array([1, 2, 3]))).toBe(false)
    expect(isUint8Array({})).toBe(false)
    expect(isUint8Array([1, 2, 3])).toBe(false)
  })
})
