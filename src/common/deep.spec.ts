import { deepMerge } from "./deep"

describe("Deep", () => {
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

  it("should simple checks", () => {
    let value = new String("Hello")
    // expect(typeof value === 'string').toBe(true)
    expect(typeof value === "object").toBe(true)
    expect(value.valueOf()).toBe("Hello")
    expect(new String(value).valueOf()).toBe("Hello")
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

  it("should merge deep", () => {
    let a = {
      hello: {
        world: 42,
      },
      before: {
        magic: 666,
      },
    }

    let b = {
      hello: {
        world: -1,
        sea: "none",
      },
      other: {
        fish: 2,
      },
    }

    let c = {
      other: {
        fish: 8,
      },
    }

    let d = deepMerge(a, b, c)
    expect(d).toEqual({
      hello: {
        world: -1,
        sea: "none",
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
})
