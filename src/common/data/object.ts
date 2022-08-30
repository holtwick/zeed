import { isArray, isObject } from "./is"

/** Like `.map()` for object. Return new key and value or `undefined` to delete. */
export function objectMap<T = any>(
  obj: any,
  fn: (
    key: string,
    value: any
  ) => [key: string, value: T] | T | undefined | null
): Record<string, T> {
  if (!isObject(obj)) return {}
  return Object.fromEntries(
    Object.entries(obj)
      .map(([k, v]) => {
        let r = fn(k, v)
        if (isArray(r) && r.length === 2) {
          return r
        }
        return [k, r]
      })
      .filter((v) => v != null)
  )
}

/** Merge right into left object. If dispose is defined, it will be combined. Left can be a complex object i.e. a insantiated class. */
export function objectMergeDisposable<A extends object, B extends object>(
  a: A,
  b: B
): A & B {
  // @ts-ignore
  if (b.dispose && a.dispose) {
    // @ts-ignore
    b.dispose.add(a.dispose)
  }
  return Object.assign(a, b)
}

// export function objectMerge<A, B>(a: A, b: B): A & B {
//   return Object.assign({}, a, b)
// }
