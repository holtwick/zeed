import { isArray, isObject } from './is'

/** Like `.map()` for object. Return new key and value or `undefined` to delete. */
export function objectMap<T = any>(
  obj: any,
  fn: (key: string, value: any) => [key: string, value: T] | T | undefined | null,
): Record<string, T> {
  if (!isObject(obj))
    return {}
  return Object.fromEntries(
    Object.entries(obj)
      .map(([k, v]) => {
        const r = fn(k, v)
        if (isArray(r) && r.length === 2)
          return r
        return [k, r]
      })
      .filter(v => v != null),
  )
}

/** Merge right into left object. If dispose is defined, it will be combined. Left can be a complex object i.e. a insantiated class. */
export function objectMergeDisposable<A extends object, B extends object>(
  a: A,
  b: B,
): A & B {
  // @ts-expect-error xxx
  if (b.dispose && a.dispose) {
    // @ts-expect-error xxx
    b.dispose.add(a.dispose)
  }
  return Object.assign(a, b)
}

// export function objectMerge<A, B>(a: A, b: B): A & B {
//   return Object.assign({}, a, b)
// }

export function objectIsEmpty(obj: object) {
  return Object.keys(obj).length <= 0
}

// https://stackoverflow.com/a/56592365/140927
export function objectPick<T extends object, K extends keyof T>(obj: T, ...keys: K[]) {
  return Object.fromEntries(keys.filter(key => key in obj).map(key => [key, obj[key]])) as Pick<T, K>
}

export function objectInclusivePick<T extends object, K extends (string | number | symbol)>(obj: T, ...keys: K[]) {
  return Object.fromEntries(keys.map(key => [key, obj[key as unknown as keyof T]])) as { [key in K]: key extends keyof T ? T[key] : undefined }
}

export function objectOmit<T extends object, K extends keyof T>(obj: T, ...keys: K[]) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key as K))) as Omit<T, K>
}
