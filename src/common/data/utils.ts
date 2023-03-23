// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import type { Json } from '../types'
import { jsonStringifySafe } from './json'

/**
 * Call a create function if key does not yet exist on an object. Returns the found or created object. Example:
 *
 * ```js
 * function createRoom(room, rooms) { return new Room() }
 * ensureKey(rooms, room, createRoom).enter()
 * ```
 */
export function ensureKey<T>(
  obj: Record<string, T>,
  key: string,
  createFn: (key?: string, obj?: Record<string, T>) => T,
): T {
  let value = obj[key]
  if (value === undefined) {
    value = createFn(key, obj)
    obj[key] = value
  }
  return value
}

/**
 * Call a create function if key does not yet exist on an object. Returns the found or created object. Example:
 *
 * ```js
 * async function fetchItem(id, cache) { ... }
 * let data = await ensureKey(cache, id, fetchItem)
 * ```
 */
export async function ensureKeyAsync<T>(
  obj: Record<string, T>,
  key: string,
  createFn: (key?: string, obj?: Record<string, T>) => Promise<T>,
): Promise<T> {
  let value = obj[key]
  if (value === undefined) {
    value = await createFn(key, obj)
    obj[key] = value
  }
  return value
}

export function size(obj: any) {
  if (obj != null) {
    if (obj.size != null)
      return obj.size

    if (obj.length != null)
      return obj.length

    return Object.keys(obj).length
  }
  return 0
}

export function first<T>(array?: T[]): T | undefined {
  return (array != null && array.length > 0) ? array[0] : undefined
}

export function last<T>(array?: T[]): T | undefined {
  return (array != null && array.length > 0) ? array[array.length - 1] : undefined
}

// True for [], {}, "", Map(), Set() and all primitives
export function empty(value: any): boolean {
  try {
    if (value != null) {
      if (Array.isArray(value))
        return value.length <= 0
      else if (typeof value === 'string')
        return value.length <= 0
      else if (value?.size != null)
        return value.size <= 0
      else
        return Object.keys(value).length <= 0
    }
  }
  catch (err) {
    console.warn('Failed to check if empty for', value, err)
  }
  return true
}

// Also see common/data/deep.ts
export function cloneObject<T>(obj: T): T {
  // Primitives are immutable anyway
  if (Object(obj) !== obj)
    return obj

  // Rude but very efficient way to clone
  return JSON.parse(jsonStringifySafe(obj))
}

// export const cloneObject = typeof structuredClone !== 'undefined' ? structuredClone : _cloneObject

// Also see common/data/deep.ts
export function cloneJsonObject<T = Json>(obj: T): T {
  // Primitives are immutable anyway
  if (Object(obj) !== obj)
    return obj

  // Rude but very efficient way to clone
  return JSON.parse(jsonStringifySafe(obj))
}

// export function cloneStructuredObject<T>(obj: T): T {
//   // Primitives are immutable anyway
//   if (Object(obj) !== obj) return obj

//   // https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
//   // @ts-ignore
//   return typeof structuredClone !== "undefined"
//     ? // @ts-ignore
//       structuredClone(obj)
//     : // Rude but very efficient way to clone
//       JSON.parse(JSON.stringify(obj))
// }

/**
 * Cache result of a function. Same arguments have to always return the same result in order to get expected optimization!
 *
 * ```
 * const square = memoize((value) => value * value)`
 * square(2) // == 2
 * ```
 */
export function memoize<In, Out>(fn: (arg: In) => Out): (arg: In) => Out {
  const cache = new Map<In, Out>()
  return (n: In): Out => {
    if (cache.has(n))
      return cache.get(n)!
    const result = fn(n)
    cache.set(n, result)
    return result
  }
}

export function memoizeAsync<In extends any[], Out extends Promise<any>>(fn: (...arg: In) => Out): (...arg: In) => Promise<Out> {
  const cache = new Map<string, Out>()
  return async (...n: In): Promise<Out> => {
    const key = jsonStringifySafe(n)
    if (cache.has(key))
      return cache.get(key)!

    const result = await fn(...n)
    cache.set(key, result)
    return result
  }
}

// let cacheMemoizeDomain: any

// /**
//  * Same as `memoize` but does not require global const.
//  */
// export function memoizeDomain<In, Out>(domain: string, fn: (arg: In) => Out): (arg: In) => Out {
//   if (cacheMemoizeDomain == null)
//     cacheMemoizeDomain = new Map<string, Map<In, Out>>()
//   if (!cacheMemoizeDomain.has(domain))
//     cacheMemoizeDomain.set(domain, new Map())
//   const cache = cacheMemoizeDomain.get(domain)
//   return (n: In): Out => {
//     if (cache.has(n))
//       return cache.get(n)!
//     const result = fn(n)
//     cache.set(n, result)
//     return result
//   }
// }

// export default function memoizeMultiArguments<T extends Function>(func: T) {
//   const cache = new Map()

//   const memoized = function (...args: any[]) {
//     let innerCache = cache

//     // first layer of the map is the arguments length
//     // if two calls have different number of arguments
//     // then they cannot be the same call
//     if (!innerCache.has(args.length))
//       innerCache.set(args.length, new Map())

//     innerCache = innerCache.get(args.length)

//     // using args.length because func.length is 0 for variadic functions
//     for (let i = 0; i < args.length - 1; i++) {
//       const key = args[i]
//       if (!innerCache.has(key))
//         innerCache.set(key, new Map())

//       innerCache = innerCache.get(key)
//     }

//     const key = args[args.length - 1]
//     if (innerCache.has(key))
//       return innerCache.get(key)

//     const result = func(...args)
//     innerCache.set(key, result)
//     return result
//   }

//   return memoized
// }

/** Repeat `count` times. Starts with `0` */
export function forTimes<T = undefined>(
  count: number,
  fn: (i: number, count: number) => T,
): T[] {
  const result = []
  for (let i = 0; i < count; i++)
    result.push(fn(i, count))

  return result
}
