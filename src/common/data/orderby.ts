// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

export function parseOrderby(value: string = ""): {
  field: string
  orderby: string
  asc: boolean
  desc: boolean
} {
  let [field = "", orderby = "asc"] = value.split(" ")
  orderby = orderby.toLowerCase()
  return {
    field,
    orderby,
    asc: orderby !== "desc",
    desc: orderby === "desc",
  }
}

export function composeOrderby(field: string, asc: boolean = true): string {
  return `${field} ${asc ? "asc" : "desc"}`
}

// Classic compare function with direction flag
export function cmp(a: any, b: any, asc: boolean = true): -1 | 0 | 1 {
  const aa = a || 0
  const bb = b || 0
  return aa > bb ? (asc ? 1 : -1) : aa < bb ? (asc ? -1 : 1) : 0
}

// todo: support localeCompare()
export function sortedOrderby<T>(values: T[], ...orderby: string[]): T[] {
  if (orderby.length > 0) {
    let orderByList = orderby.map(parseOrderby)
    // let { field, asc } = parseOrderby(orderby)
    //if (field != null && typeof field === "string") {
    // let bigger = asc ? 1 : -1
    // let smaller = asc ? -1 : 1
    let sortValues = Array.from(values)
    sortValues.sort((a: any, b: any): number => {
      for (let { field, asc } of orderByList) {
        const result = cmp(a[field], b[field], asc)
        if (result !== 0) return result
      }
      return 0
      // const aa = a[field] || 0
      // const bb = b[field] || 0
      // return aa > bb ? bigger : aa < bb ? smaller : 0
    })
    return sortValues
  }
  return values
}
