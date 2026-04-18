/* eslint-disable no-new-wrappers */

import { DefaultLogger } from '../log'
import { deepEqual, deepMerge, deepStripUndefinedInPlace } from './deep'

const log = DefaultLogger('test:deep')

describe('deep', () => {
  it('should deep without self reference', () => {
    const sample: any = {
      a: 1,
    }
    sample.b = sample
    const sample2: any = {
      a: 1,
    }
    sample2.b = sample2

    log('sample', sample)

    // false because cyclic
    expect(deepEqual(sample, sample2)).toBe(false)
  })

  it('should compare arays', () => {
    const a = [1, 2, 3]
    const b = [3, 2, 1]
    expect(deepEqual(a, b)).toBe(false)
    const c = [3, 2, 1, 0]
    expect(deepEqual(a, c)).toBe(false)
  })

  // it('should clone simple', () => {
  //   let a = {
  //     hello: {
  //       world: 42,
  //     },
  //   }
  //   let b = deepClone(a)
  //   expect(b).toEqual(a)
  //   expect(deepEqual(a, b)).toBeTruthy()
  //
  //   a.hello.world = -1
  //   expect(deepEqual(a, b)).toBeFalsy()
  //
  //   b.hello.world = -1
  //   expect(deepEqual(a, b)).toBeTruthy()
  // })

  it('should simple checks', () => {
    const value = new String('Hello')
    // expect(typeof value === 'string').toBe(true)
    expect(typeof value === 'object').toBe(true)
    expect(value.valueOf()).toBe('Hello')
    expect(new String(value).valueOf()).toBe('Hello')
  })

  // it('should clone complex', () => {
  //   let a = {
  //     one: {
  //       'one-one': new String('hello'),
  //       'one-two': [
  //         'one', 'two', true, 'four',
  //       ],
  //     },
  //     // two: document.createElement('div'),
  //     three: [
  //       {
  //         name: 'three-one',
  //         number: new Number('100'),
  //         obj: new function () {
  //           this.name = 'Object test'
  //         },
  //       },
  //     ],
  //   }
  //   let b = deepClone(a)
  //   expect(b).toEqual(a)
  //   expect(deepEqual(a, b)).toBeTruthy()
  // })
  //
  // it('should handle cyclic', () => {
  //   let a = {
  //     data: 1,
  //     children: [{
  //       data: 2,
  //       parent: null,
  //     }],
  //   }
  //   a.children[0].parent = a
  //   let b = deepClone(a)
  //   expect(b).toEqual(a)
  //   expect(deepEqual(a, b)).toBeTruthy()
  // })

  // it('should clone', () => {
  //   expect(deepClone(123)).toEqual(123)
  //   expect(deepClone([1, 2])).toEqual([1, 2])
  //   expect(deepClone({ c: 1, a: { d: 0, c: 1, e: { a: 0, 1: 4 } } })).toEqual({ c: 1, a: { d: 0, c: 1, e: { a: 0, 1: 4 } } })
  // })

  it('should merge deep', () => {
    const a = {
      hello: {
        world: 42,
      },
      before: {
        magic: 666,
      },
    }

    const b = {
      hello: {
        world: -1,
        sea: 'none',
      },
      other: {
        fish: 2,
      },
    }

    const c = {
      other: {
        fish: 8,
      },
    }

    const d = deepMerge(a, b, c)
    expect(d).toEqual({
      hello: {
        world: -1,
        sea: 'none',
      },
      other: {
        fish: 8,
      },
      before: {
        magic: 666,
      },
    })
  })

  // it('should clone primitives', () => {
  //   class Sample {
  //     constructor() {
  //       this.a = Math.random()
  //     }
  //   }
  //
  //   let a = {
  //     one: {
  //       'sample': new Sample(),
  //       'one-one': new String('hello'),
  //       'one-two': [
  //         'one', 'two', true, 'four',
  //       ],
  //     },
  //     // two: document.createElement('div'),
  //     three: [
  //       {
  //         name: 'three-one',
  //         number: new Number('100'),
  //         obj: new function () {
  //           this.name = 'Object test'
  //         },
  //       },
  //     ],
  //   }
  //   let b = deepClone(a)
  //   expect(b).toEqual(a)
  //   expect(deepEqual(a, b)).toBeTruthy()
  //   // expect(a.three[0].obj === b.three[0].obj).toBe(true)
  //   // expect(a.one.sample === b.one.sample).toBe(true)
  //   // expect(a.one.sample.a === b.one.sample.a).toBe(true)
  // })

  it('deepEqual handles branch cases', () => {
    expect(deepEqual(1, 2)).toBe(false)
    expect(deepEqual(null, {})).toBe(false)
    expect(deepEqual({}, null)).toBe(false)
    class A { x = 1 }
    class B { x = 1 }
    expect(deepEqual(new A(), new B())).toBe(false)
    expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false)
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false)
    expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true)

    const proto = { inherited: 1 }
    const x: any = Object.create(proto)
    x.own = 1
    const y: any = Object.create(proto)
    y.own = 1
    expect(deepEqual(x, y)).toBe(true)
  })

  it('deepStripUndefinedInPlace handles cycles and primitives', () => {
    expect(deepStripUndefinedInPlace(5)).toBe(5)
    const cyc: any = { a: 1 }
    cyc.self = cyc
    const result = deepStripUndefinedInPlace(cyc)
    expect(result).toBe(cyc)
    expect(cyc.a).toBe(1)
    const obj: any = Object.create({ inherited: 1 })
    obj.own = undefined
    obj.keep = 2
    deepStripUndefinedInPlace(obj)
    expect('own' in obj).toBe(false)
    expect(obj.keep).toBe(2)
  })

  it('deepMerge handles non-object target and source', () => {
    expect(deepMerge(null as any, { a: 1 })).toEqual({ a: 1 })
    expect(deepMerge({ a: 1 }, null)).toEqual({ a: 1 })
    expect(deepMerge({ a: 1 }, 'str' as any)).toEqual({ a: 1 })
  })

  it('deepMerge concatenates arrays', () => {
    expect(deepMerge({ list: [1, 2] }, { list: [3, 4] })).toEqual({ list: [1, 2, 3, 4] })
  })

  it('should strip undefined', () => {
    const sample = {
      hello: {
        world: -1,
        null1: null,
        undefined1: undefined,
        sea: 'none',
      },
      undefined1: undefined,
      other: [
        {
          fish: 8,
          undefined1: undefined,
        },
        undefined,
        null,
        'Hello',
      ],
      before: {
        magic: 666,
      },
    }

    // Haha, this is simpler :) But not working in lists
    expect(JSON.stringify(sample, null, 2)).toMatchInlineSnapshot(`
      "{
        "hello": {
          "world": -1,
          "null1": null,
          "sea": "none"
        },
        "other": [
          {
            "fish": 8
          },
          null,
          null,
          "Hello"
        ],
        "before": {
          "magic": 666
        }
      }"
    `)

    expect(deepStripUndefinedInPlace(sample)).toMatchInlineSnapshot(`
      Object {
        "before": Object {
          "magic": 666,
        },
        "hello": Object {
          "null1": null,
          "sea": "none",
          "world": -1,
        },
        "other": Array [
          Object {
            "fish": 8,
            "undefined1": undefined,
          },
          null,
          "Hello",
        ],
      }
    `)
  })
})
