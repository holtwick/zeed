import { useDispose } from '../dispose-defer'
import { Emitter } from '../msg/emitter'
import { isNotNull } from './is'
import { objectInclusivePick, objectMap, objectMergeDisposable, objectOmit, objectPick, objectPlain } from './object'

describe('object.spec', () => {
  it('should map it', async () => {
    const sample = {
      a: 1,
      b: 2,
    }
    expect(objectMap<number>(sample, (k, v) => v + 10)).toMatchInlineSnapshot(`
      Object {
        "a": 11,
        "b": 12,
      }
    `)
    expect(objectMap(sample, (k, v) => [`${k}_${v}`, k]))
      .toMatchInlineSnapshot(`
        Object {
          "a_1": "a",
          "b_2": "b",
        }
      `)
  })

  it('should merge', async () => {
    const emitter = new Emitter()
    const obj = {
      dispose: useDispose(),
      f() {
        return 42
      },
    }
    let x = 1
    obj.dispose.add(() => x++)
    const m = objectMergeDisposable(emitter, obj)
    expect(m.f()).toBe(42)
    m.on('a', () => x++)
    void m.emit('a')
    expect(x).toBe(2)
    await m.dispose()
    expect(x).toBe(3)
  })

  // it("should merge vice versa", async () => {
  //   let emitter = new Emitter()
  //   let obj = {
  //     dispose: useDispose(),
  //     f() {
  //       return 42
  //     },
  //   }
  //   let x = 1
  //   obj.dispose.add(() => x++)
  //   let m = objectMergeDisposable(obj, emitter)
  //   expect(m.f()).toBe(42)
  //   m.on("a", () => x++)
  //   m.emit("a")
  //   expect(x).toBe(2)
  //   await m.dispose()
  //   expect(x).toBe(3)
  // })

  it('should omit and pick', () => {
    const o = { a: 1, b: 2, c: 3, d: 4 }
    expect(objectPick(o, 'a', 'c')).toMatchInlineSnapshot(`
      Object {
        "a": 1,
        "c": 3,
      }
    `)
    expect(objectOmit(o, 'a', 'c')).toMatchInlineSnapshot(`
      Object {
        "b": 2,
        "d": 4,
      }
    `)
    expect(objectInclusivePick(o, 'a', 'c', 'x')).toMatchInlineSnapshot(`
      Object {
        "a": 1,
        "c": 3,
        "x": undefined,
      }
    `)
  })
})

describe('objectPlain', () => {
  it('should return the plain object', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4],
      },
    }
    const result = objectPlain(obj)
    expect(result).toEqual(obj)
  })

  it('should handle circular references', () => {
    const obj: any = {
      a: 1,
    }
    obj.b = obj
    const result = objectPlain(obj, { circleValue: '*** CIRCULAR ***' })
    expect(result).toMatchInlineSnapshot(`
      Object {
        "a": 1,
        "b": "*** CIRCULAR ***",
      }
    `)
  })

  it('should handle nested objects', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    }
    const result = objectPlain(obj)
    expect(result).toEqual(obj)
  })

  it('should handle arrays', () => {
    const obj = {
      a: 1,
      b: [2, 3, 4],
    }
    const result = objectPlain(obj)
    expect(result).toEqual(obj)
  })

  it('should handle max depth', () => {
    const obj = {
      a: {
        b: {
          c: {
            d: {
              e: 1,
            },
          },
        },
      },
    }
    const result = objectPlain(obj, { maxDepth: 3, maxDepthValue: '*** MAX DEPTH ***' })
    expect(result).toEqual({
      a: {
        b: {
          c: {
            d: '*** MAX DEPTH ***',
          },
        },
      },
    })
  })

  it('should handle removeUndefined', () => {
    const obj = {
      a: 1,
      b: undefined,
      c: [1, undefined],
    }
    const result = objectPlain(obj, { filter: isNotNull })
    expect(result).toEqual({ a: 1, c: [1] })
  })

  it('should also support crazy stuff', () => {
    function fn(this: any) {
      this.y = 1
    }
    fn.prototype.x = 2
    fn.z = 6

    const obj = {
      a: 1,
      b: {
        x: Symbol('x'),
        y: BigInt(123),
        fn,
        nan: Number.NaN,
        inf: Number.POSITIVE_INFINITY,
        err: new Error('err'),
        set: new Set([1, { x: 1 }, 3]),
        rx: /.*?.test/gim,
        map: new Map<any, any>([
          ['a', 1],
          ['b', 2],
          [true, 'bool'],
        ]),
        weakMap: new WeakMap(),
        uint8: new Uint8Array([1, 2, 3]),
        uint16: new Uint16Array([1, 2, 3]),
        c: 2,
        d: [3, 4, 5],
      },
    }
    const result = objectPlain(obj, {
      keepAsIs: o => o instanceof Uint8Array,
      errorTrace: false,
    })

    expect(result).toMatchInlineSnapshot(`
      Object {
        "a": 1,
        "b": Object {
          "c": 2,
          "d": Array [
            3,
            4,
            5,
          ],
          "err": "Error: err",
          "fn": Object {
            "z": 6,
          },
          "inf": Infinity,
          "map": Object {
            "a": 1,
            "b": 2,
            "true": "bool",
          },
          "nan": NaN,
          "rx": "/.*?.test/gim",
          "set": Array [
            1,
            Object {
              "x": 1,
            },
            3,
          ],
          "uint16": Array [
            1,
            2,
            3,
          ],
          "uint8": Uint8Array [
            1,
            2,
            3,
          ],
          "weakMap": Object {},
          "x": "Symbol(x)",
          "y": 123n,
        },
      }
    `)
  })
})
