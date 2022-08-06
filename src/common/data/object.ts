import { isArray } from "./is"

export function objectMap(
  obj: object,
  fn: (
    key: string,
    value: any
  ) => [key: string, value: any] | any | undefined | null
): object {
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
