// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from '../../index.log'
import { deepEqual, deepMerge, deepStripUndefinedInPlace } from './deep'

const log = Logger('test:deep')

describe('Deep', () => {
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
    const a = [1,2,3]
    const b = [3,2,1]
    expect(deepEqual(a,b)).toBe(false)  
    const c = [3,2,1,0]
    expect(deepEqual(a,c)).toBe(false)  
  });

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
        \\"hello\\": {
          \\"world\\": -1,
          \\"null1\\": null,
          \\"sea\\": \\"none\\"
        },
        \\"other\\": [
          {
            \\"fish\\": 8
          },
          null,
          null,
          \\"Hello\\"
        ],
        \\"before\\": {
          \\"magic\\": 666
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
