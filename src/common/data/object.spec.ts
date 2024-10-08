import { useDispose } from '../dispose-defer'
import { Emitter } from '../msg/emitter'
import { isBoolean, isNotNull } from './is'
import { objectFilter, objectInclusivePick, objectMap, objectMergeDisposable, objectOmit, objectPick, objectPlain } from './object'

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

  it('should handle bool', async () => {
    const x = objectPlain({ test: true, fdsf: { fsdafs: false } }, {
      transformer: (obj) => {
        if (isBoolean(obj))
          return +obj
      },
    })
    expect(x).toMatchInlineSnapshot(`
      Object {
        "fdsf": Object {
          "fsdafs": 0,
        },
        "test": 1,
      }
    `)
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

    class Klass {
      name: string

      constructor(name?: string) {
        this.name = name ?? 'test'
      }
    }

    const obj = {
      a: 1,
      b: {
        x: Symbol('x'),
        y: BigInt(123),
        fn,
        bool: true,
        nan: Number.NaN,
        inf: Number.POSITIVE_INFINITY,
        err: new Error('err'),
        set: new Set([1, { x: 1 }, 3]),
        rx: /.+?test/gi,
        map: new Map<any, any>([
          ['a', 1],
          ['b', 2],
          [true, 'bool'],
        ]),
        date: new Date(Date.UTC(2024, 0, 1, 12)),
        weakMap: new WeakMap(),
        uint8: new Uint8Array([1, 2, 3]),
        uint16: new Uint16Array([1, 2, 3]),
        c: 2,
        d: [3, 4, 5],
        Klass,
        newKlass: new Klass('testNewKlass'),
      },
    }

    const result = objectPlain(obj, {
      keepAsIs: o => o instanceof Uint8Array,
      errorTrace: false,
      transformer(obj) {
        if (obj instanceof Date)
          return { __timestamp: obj.getTime() }
        if (isBoolean(obj))
          return +obj
      },
    })

    expect(result).toMatchInlineSnapshot(`
      Object {
        "a": 1,
        "b": Object {
          "Klass": Object {
            "__class": "Function",
          },
          "bool": 1,
          "c": 2,
          "d": Array [
            3,
            4,
            5,
          ],
          "date": Object {
            "__timestamp": 1704110400000,
          },
          "err": Object {
            "__class": "Error",
            "cause": undefined,
            "message": "err",
            "name": "Error",
            "stack": undefined,
          },
          "fn": Object {
            "__class": "Function",
            "z": 6,
          },
          "inf": Infinity,
          "map": Object {
            "a": 1,
            "b": 2,
            "true": "bool",
          },
          "nan": NaN,
          "newKlass": Object {
            "__class": "Klass",
            "name": "testNewKlass",
          },
          "rx": Object {
            "__class": "RegExp",
            "source": "/.+?test/gi",
          },
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
          "weakMap": Object {
            "__class": "WeakMap",
          },
          "x": "Symbol(x)",
          "y": 123n,
        },
      }
    `)

    const result2 = objectPlain(obj)
    expect(objectPlain(result2)).toEqual(result2)
  })
})

describe('objectFilter', () => {

  it('should return an empty object for non-object inputs', () => {
    expect(objectFilter(null, () => true)).toEqual({});
    expect(objectFilter(undefined, () => true)).toEqual({});
    expect(objectFilter(42, () => true)).toEqual({});
    expect(objectFilter('string', () => true)).toEqual({});
  });

  it('should return an empty object if the object has no properties that match the filter', () => {
    const input = { a: 1, b: 2, c: 3 };
    const result = objectFilter(input, (key, value) => value > 5);
    expect(result).toEqual({});
  });

  it('should return an object with properties that match the filter', () => {
    const input = { a: 1, b: 2, c: 3, d: 4 };
    const result = objectFilter(input, (key, value) => value % 2 === 0);
    expect(result).toEqual({ b: 2, d: 4 });
  });

  it('should return an object with properties that match the filter based on keys', () => {
    const input = { a: 1, b: 2, c: 3, d: 4 };
    const result = objectFilter(input, (key) => key === 'a' || key === 'c');
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('should handle an empty object', () => {
    const input = {};
    const result = objectFilter(input, () => true);
    expect(result).toEqual({});
  });

  it('should return a partial object when some properties match the filter', () => {
    const input = { a: 1, b: 2, c: 3, d: 4 };
    const result = objectFilter(input, (key, value) => key !== 'b');
    expect(result).toEqual({ a: 1, c: 3, d: 4 });
  });
})
