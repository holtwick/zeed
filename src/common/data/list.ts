export type FilterFunction<T> = (o: T) => boolean
export type MapperFunction<T> = (o: T) => any

/** Apply multiple filters, optionally transform through mappers, filter null/undefined items. */
export function listQuery<T>(
  list: T[],
  filters: FilterFunction<T>[],
  mappers: MapperFunction<T>[] = []
): T | any[] {
  return list
    .filter((o) => {
      return !filters.some((a) => !a(o))
    })
    .map((o) => {
      for (const m of mappers) {
        o = m(o)
      }
      return o
    })
    .filter((o) => o != null)
}

export function listGroupBy<T extends Record<string, any>>(
  list: T[],
  key: keyof T
): Record<string, T[]> {
  return list.reduce((result: any, currentValue: T) => {
    const groupValue = String(currentValue[key])
    ;(result[groupValue] = result[groupValue] || []).push(currentValue)
    return result
  }, {})
}

export function listDistinctUnion<T extends Record<string, any>>(
  list: T[],
  key: keyof T
): any[] {
  return Array.from(
    list.reduce(
      (result: Set<any>, currentValue: T) => result.add(currentValue[key]),
      new Set()
    )
  )
}
