// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { isObject, isPrimitive } from "./is"

export function deepEqual(a: any, b: any, hash = new WeakSet()) {
  // if both x and y are null or undefined and exactly the same
  if (a === b) {
    return true
  }

  // Cyclic
  if (hash.has(b)) {
    // console.log('cyclic')
    return true
  }

  if (!isPrimitive(b)) {
    hash.add(b)
  }

  // if they are not strictly equal, they both need to be Objects
  if (!(a instanceof Object) || !(b instanceof Object)) {
    return false
  }

  // they must have the exact same prototype chain, the closest we can do is
  // test there constructor.
  if (a.constructor !== b.constructor) {
    return false
  }

  // Shortcut to avoid to many loops
  if (a.length !== b.length) {
    return false
  }

  for (let p in a) {
    // other properties were tested using x.constructor === y.constructor
    if (!a.hasOwnProperty(p)) {
      continue
    }

    // allows to compare x[ p ] and y[ p ] when set to undefined
    if (!b.hasOwnProperty(p)) {
      return false
    }

    let aa = a[p]
    let bb = b[p]

    // if they have the same strict value or identity then they are equal
    // if (aa === bb) {
    //   console.log('eq', typeof bb)
    //   if (bb != null) hash.set(bb, true)
    //   continue
    // }
    //
    // // Numbers, Strings, Functions, Booleans must be strictly equal
    // if (typeof (aa) !== 'object') {
    //   return false
    // }

    // Objects and Arrays must be tested recursively
    if (!deepEqual(aa, bb, hash)) {
      return false
    }
  }

  // allows x[ p ] to be set to undefined
  for (let p in b) {
    if (b.hasOwnProperty(p) && !a.hasOwnProperty(p)) {
      return false
    }
  }

  return true
}

export function deepMerge(target: any, ...sources: any[]) {
  for (let source of sources) {
    if (!isObject(target)) {
      target = {}
    }

    if (source == null || !isObject(source)) continue

    Object.keys(source).forEach((key) => {
      const targetValue = target[key]
      const sourceValue = source[key]

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue)
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = deepMerge(Object.assign({}, targetValue), sourceValue)
      } else {
        target[key] = sourceValue
      }
    })
  }

  return target
}

// // https://stackoverflow.com/a/40294058/140927
// // Handles cyclic references
// export function deepClonePrimitives(obj, hash = new WeakMap()) {
//
//   // primitives
//   if (Object(obj) !== obj) {
//     // log('Primitive', obj)
//     return obj
//   }
//
//   // cyclic reference
//   if (hash.has(obj)) {
//     return hash.get(obj)
//   }
//
//   let result
//
//   // primitives as objects like new String(), new Number()
//   if (
//     obj instanceof String ||
//     obj instanceof Number ||
//     obj instanceof BigInt ||
//     obj instanceof Boolean ||
//     obj instanceof Symbol
//   ) {
//     result = new obj.constructor(obj.valueOf())
//     // hash.set(obj, result)
//     return result
//   }
//
//   // log('Obj', obj)
//
//   if (obj instanceof Set) {
//     result = new Set(obj)
//   } else if (obj instanceof Map) {
//     result = new Map(Array.from(obj, ([key, val]) => [key, deepClonePrimitives(val, hash)]))
//   } else if (obj instanceof Date) {
//     result = new Date(obj)
//   } else if (obj instanceof RegExp) {
//     result = new RegExp(obj.source, obj.flags)
//   } else if (Array.isArray(obj)) {
//     result = Array.from(obj, val => deepClonePrimitives(val, hash))
//   } else if (obj.constructor) {
//     result = new obj.constructor()
//     log('bj object', result)
//   } else if (obj instanceof Function || typeof obj === 'function') {
//     log('Keep object', obj, Object.getPrototypeOf(obj))
//     result = obj
//   } else {
//     result = Object.create(null)
//   }
//
//   hash.set(obj, result)
//
//   return Object.assign(result, ...Object.keys(obj).map(key => ({
//     [key]: deepClonePrimitives(obj[key], hash),
//   })))
// }
