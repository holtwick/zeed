import { isArray, isObject } from "./is"

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
