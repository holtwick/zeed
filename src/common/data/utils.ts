// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

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

export function cloneObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// export function timestampToDate(ts: number): Date {
//   return new Date(+ts * 1000)
// }

// export function dateToTimestamp(date: Date): number {
//   return date.getTime() / 1000
// }
