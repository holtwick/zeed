// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { isNotNull, isObject, isPrimitive, isRecord, isRecordPlain, isUint8Array, isValue } from './is'

describe('is', () => {
  it('should identify Uint8Array', () => {
    expect(isUint8Array(new Uint8Array([1, 2, 3]))).toBe(true)
    expect(isUint8Array(new Uint16Array([1, 2, 3]))).toBe(false)
    expect(isUint8Array({})).toBe(false)
    expect(isUint8Array([1, 2, 3])).toBe(false)
  })

  it('should identify object correctly', () => {
    class X {
      foo() { return 'bar' }
    }
    const x = new X()
    const plain = { hello: 'world' }

    expect(isObject(X)).toBe(false)
    expect(isObject(x)).toBe(true)
    expect(isObject(plain)).toBe(true)
    expect(isObject([])).toBe(true)
    expect(isObject(123)).toBe(false)

    expect(isRecord(X)).toBe(false)
    expect(isRecord(x)).toBe(true)
    expect(isRecord(plain)).toBe(true)
    expect(isRecord([])).toBe(false)
    expect(isRecord(123)).toBe(false)

    expect(isRecordPlain(X)).toBe(false)
    expect(isRecordPlain(x)).toBe(false)
    expect(isRecordPlain(plain)).toBe(true)
    expect(isRecordPlain([])).toBe(false)
    expect(isRecordPlain(123)).toBe(false)

    expect(isPrimitive(X)).toBe(false)
    expect(isPrimitive(x)).toBe(false)
    expect(isPrimitive(plain)).toBe(false)
    expect(isPrimitive([])).toBe(false)
    expect(isPrimitive(123)).toBe(true)
  })

  it('should filter', async () => {
    const test = ['a', null, undefined, 'b', false, 'c', true]
    const r: (string | true)[] = test.filter(isNotNull)
    expect(r).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
        false,
        "c",
        true,
      ]
    `)

    const rr: string[] = test.filter(isValue)
    expect(rr).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
        "c",
      ]
    `)
  })
})
