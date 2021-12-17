// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Json } from "../types"

export function size(obj: any) {
  if (obj != null) {
    if (obj.size != null) {
      return obj.size
    }
    if (obj.length != null) {
      return obj.length
    }
    return Object.keys(obj).length
  }
  return 0
}

export function last<T>(array?: T[]): T | undefined {
  return array != null && array.length > 0 ? array[array.length - 1] : undefined
}

// True for [], {}, "", Map(), Set() and all primitives
export function empty(value: any): boolean {
  try {
    if (value != null) {
      if (Array.isArray(value)) {
        return value.length <= 0
      } else if (typeof value === "string") {
        return value.length <= 0
      } else if (value?.size != null) {
        return value.size <= 0
      } else {
        return Object.keys(value).length <= 0
      }
    }
  } catch (err) {
    console.error("Failed to check if empty for", value, err)
  }
  return true
}

// Also see common/data/deep.ts
export function cloneObject<T>(obj: T): T {
  // Primitives are immutable anyway
  if (Object(obj) !== obj) return obj

  // Rude but very efficient way to clone
  return JSON.parse(JSON.stringify(obj))
}

// Also see common/data/deep.ts
export function cloneJsonObject<T = Json>(obj: T): T {
  // Primitives are immutable anyway
  if (Object(obj) !== obj) return obj

  // Rude but very efficient way to clone
  return JSON.parse(JSON.stringify(obj))
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
