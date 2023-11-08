// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { sleep } from '../exec'
import {
  cloneObject,
  empty,
  ensureKey,
  forTimes,
  memoize,
  memoizeAsync,
  size,
} from './utils'

describe('cloneObject', () => {
  it('should clone only non primitives', () => {
    {
      const sample = 'Test'
      expect(cloneObject(sample) === sample).toBe(true)
      expect(cloneObject(sample) === 'Test').toBe(true)
    }
    {
      const sample = { hello: 'world' }
      expect(cloneObject(sample) === sample).toBe(false)
      expect(cloneObject(sample)).toEqual(sample)
      // expect(sample === { hello: "world" }).toBe(false)
      expect(cloneObject(sample)).toEqual({ hello: 'world' })
    }
  })
})

describe('size', () => {
  it('should calc size of map', () => {
    const map = new Map()
    map.set('a', 1)
    map.set('b', 2)
    expect(size(map)).toBe(2)
  })

  it('should calc size of set', () => {
    const set = new Set()
    set.add(1)
    set.add(2)
    set.add(3)
    expect(size(set)).toBe(3)
  })

  it('should calc size of object', () => {
    expect(size({ a: 1, b: 2 })).toBe(2)
  })

  it('should calc size of array', () => {
    expect(size([1, 2, undefined])).toBe(3)
  })

  it('should calc size of primitives', () => {
    expect(size('hello')).toBe(5)
    expect(size(3)).toBe(0)
    expect(size(true)).toBe(0)
    expect(size(null)).toBe(0)
    expect(size(undefined)).toBe(0)
    expect(size(Number.NaN)).toBe(0)
  })
})

describe('empty', () => {
  it('should calc empty of map', () => {
    const map = new Map()
    expect(empty(map)).toBe(true)
    map.set('a', 1)
    map.set('b', 2)
    expect(empty(map)).toBe(false)
  })

  it('should calc empty of set', () => {
    const set = new Set()
    expect(empty(set)).toBe(true)
    set.add(1)
    set.add(2)
    set.add(3)
    expect(empty(set)).toBe(false)
  })

  it('should calc empty of object', () => {
    expect(empty({})).toBe(true)
    expect(empty({ a: 1, b: 2 })).toBe(false)
  })

  it('should calc empty of array', () => {
    expect(empty([])).toBe(true)
    expect(empty([undefined])).toBe(false)
    expect(empty([1, 2, undefined])).toBe(false)
  })

  it('should calc empty of primitives', () => {
    expect(empty('')).toBe(true)
    expect(empty('hello')).toBe(false)
    expect(empty(3)).toBe(true)
    expect(empty(0)).toBe(true)
    expect(empty(false)).toBe(true)
    expect(empty(true)).toBe(true)
    expect(empty(null)).toBe(true)
    expect(empty(undefined)).toBe(true)
    expect(empty(Number.NaN)).toBe(true)
  })

  it('should ensure key', () => {
    const rooms: any = {}
    ensureKey(rooms, 'a', r => ({ r } as any)).x = 1
    expect(rooms).toMatchInlineSnapshot(`
      Object {
        "a": Object {
          "r": "a",
          "x": 1,
        },
      }
    `)
    ensureKey(rooms, 'a', r => ({ r } as any)).x += 10
    expect(rooms).toMatchInlineSnapshot(`
      Object {
        "a": Object {
          "r": "a",
          "x": 11,
        },
      }
    `)
  })

  it('should repeat forTimes', () => {
    const l: any = []
    forTimes(10, (...args) => l.push(args))
    expect(l).toMatchInlineSnapshot(`
      Array [
        Array [
          0,
          10,
        ],
        Array [
          1,
          10,
        ],
        Array [
          2,
          10,
        ],
        Array [
          3,
          10,
        ],
        Array [
          4,
          10,
        ],
        Array [
          5,
          10,
        ],
        Array [
          6,
          10,
        ],
        Array [
          7,
          10,
        ],
        Array [
          8,
          10,
        ],
        Array [
          9,
          10,
        ],
      ]
    `)
  })

  it('should memoize', () => {
    let ctr = 1

    // this is intentionally WRONG! usually should have same result with same args.
    const fn = memoize((inc: number) => {
      ctr += inc
      return ctr
    })

    expect(fn(10)).toBe(11)
    expect(fn(10)).toBe(11)
    expect(fn(1)).toBe(12)
    expect(ctr).toBe(12)
  })

  it('should memoize async', async () => {
    let ctr = 1

    // this is intentionally WRONG! usually should have same result with same args.
    const fn = memoizeAsync(async (inc: number) => {
      await sleep(10)
      ctr += inc
      return ctr
    })

    expect(await fn(10)).toBe(11)
    expect(await fn(10)).toBe(11)
    expect(await fn(1)).toBe(12)
    expect(ctr).toBe(12)
  })
})
