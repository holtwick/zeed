import { isBinaryArray, isEmpty, isFunction, isNotEmpty, isNotNull, isNumber, isObject, isPrimitive, isRecord, isRecordPlain, isSymbol, isTruthy, isUint8Array, isValue } from './is'

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

    function fn() {
      return 'hello'
    }

    expect(isObject(X)).toBe(false)
    expect(isObject(x)).toBe(true)
    expect(isObject(plain)).toBe(true)
    expect(isObject([])).toBe(true)
    expect(isObject(123)).toBe(false)
    expect(isObject(new Date())).toBe(true)
    expect(isObject(fn)).toBe(false)

    expect(isRecord(X)).toBe(false)
    expect(isRecord(x)).toBe(true)
    expect(isRecord(plain)).toBe(true)
    expect(isRecord([])).toBe(false)
    expect(isRecord(123)).toBe(false)
    expect(isRecord(new Date())).toBe(true)
    expect(isRecord(fn)).toBe(false)

    expect(isRecordPlain(X)).toBe(false)
    expect(isRecordPlain(x)).toBe(false)
    expect(isRecordPlain(plain)).toBe(true)
    expect(isRecordPlain([])).toBe(false)
    expect(isRecordPlain(123)).toBe(false)
    expect(isRecordPlain(new Date())).toBe(false)
    expect(isRecordPlain(fn)).toBe(false)

    expect(isPrimitive(X)).toBe(false)
    expect(isPrimitive(x)).toBe(false)
    expect(isPrimitive(plain)).toBe(false)
    expect(isPrimitive([])).toBe(false)
    expect(isPrimitive(123)).toBe(true)
    expect(isPrimitive(new Date())).toBe(false)
    expect(isPrimitive(fn)).toBe(false)
  })

  it('should filter', async () => {
    const test = ['a', null, undefined, 'b', false, 'c', true, '', [], [1, 2, 3], {}, { a: 1 }]
    const r: any[] = test.filter(isNotNull)
    expect(r).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
        false,
        "c",
        true,
        "",
        Array [],
        Array [
          1,
          2,
          3,
        ],
        Object {},
        Object {
          "a": 1,
        },
      ]
    `)

    const rr: any[] = test.filter(isValue)
    expect(rr).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
        "c",
        "",
        Array [],
        Array [
          1,
          2,
          3,
        ],
        Object {},
        Object {
          "a": 1,
        },
      ]
    `)

    const rrr: any[] = test.filter(isNotEmpty)
    expect(rrr).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
        false,
        "c",
        true,
        Array [
          1,
          2,
          3,
        ],
        Object {
          "a": 1,
        },
      ]
    `)

    const rrrr: any[] = test.filter(isEmpty)
    expect(rrrr).toMatchInlineSnapshot(`
      Array [
        null,
        undefined,
        "",
        Array [],
        Object {},
      ]
    `)

    const rrrrr: any[] = test.filter(isTruthy)
    expect(rrrrr).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
        "c",
        true,
        Array [],
        Array [
          1,
          2,
          3,
        ],
        Object {},
        Object {
          "a": 1,
        },
      ]
    `)
  })

  it('should handle NaN', () => {
    const nan = +'abc'
    expect(Number.isNaN(nan)).toBe(true)
    expect(typeof nan === 'number').toBe(true)
    expect(isNumber(nan)).toBe(false)
  })

  it('should identify function correctly', () => {
    function fn() {
      return 'hello'
    }

    const arrowFn = () => 'world'

    const obj = {
      method() {
        return 'foo'
      },
    }

    const classObj = new (class {
      method() {
        return 'bar'
      }
    })()

    expect(isFunction(fn)).toBe(true)
    expect(isFunction(arrowFn)).toBe(true)

    expect(isFunction(obj.method)).toBe(true)

    expect(isFunction(classObj.method)).toBe(true)

    expect(isFunction({})).toBe(false)
    expect(isFunction([])).toBe(false)
    expect(isFunction(123)).toBe(false)
    expect(isFunction('hello')).toBe(false)
    expect(isFunction(true)).toBe(false)
    expect(isFunction(null)).toBe(false)
    expect(isFunction(undefined)).toBe(false)
  })

  it('should identify symbol correctly', () => {
    const symbol = Symbol('test')
    expect(isSymbol(symbol)).toBe(true)
    expect(isSymbol('test')).toBe(false)
    expect(isSymbol(123)).toBe(false)
    expect(isSymbol({})).toBe(false)
    expect(isSymbol([])).toBe(false)
    expect(isSymbol(null)).toBe(false)
    expect(isSymbol(undefined)).toBe(false)
  })

  it('should identify binary arrays correctly', () => {
    expect(isBinaryArray(new Uint8Array([1, 2, 3]))).toBe(true)
    expect(isBinaryArray(new Uint8ClampedArray([1, 2, 3]))).toBe(true)
    expect(isBinaryArray(new Uint16Array([1, 2, 3]))).toBe(true)
    expect(isBinaryArray(new Uint32Array([1, 2, 3]))).toBe(true)
    expect(isBinaryArray(new Int8Array([1, 2, 3]))).toBe(true)
    expect(isBinaryArray(new Int16Array([1, 2, 3]))).toBe(true)
    expect(isBinaryArray(new Int32Array([1, 2, 3]))).toBe(true)
    expect(isBinaryArray(new Float32Array([1, 2, 3]))).toBe(true)
    expect(isBinaryArray(new Float64Array([1, 2, 3]))).toBe(true)
    expect(isBinaryArray(new BigInt64Array([1n, 2n, 3n]))).toBe(true)
    expect(isBinaryArray(new BigUint64Array([1n, 2n, 3n]))).toBe(true)

    expect(isBinaryArray([])).toBe(false)
    expect(isBinaryArray({})).toBe(false)
    expect(isBinaryArray(123)).toBe(false)
    expect(isBinaryArray('hello')).toBe(false)
    expect(isBinaryArray(true)).toBe(false)
    expect(isBinaryArray(null)).toBe(false)
    expect(isBinaryArray(undefined)).toBe(false)
  })

  // ...
})
