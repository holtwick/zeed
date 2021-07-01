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
export function cmp(a: any, b: any, asc: boolean = true): number {
  const aa = a || 0
  const bb = b || 0
  return aa > bb ? (asc ? 1 : -1) : aa < bb ? (asc ? -1 : 1) : 0
}

export function sortedOrderby<T>(values: T[], orderby: string): T[] {
  let { field, asc } = parseOrderby(orderby)
  if (field != null && typeof field === "string") {
    // let bigger = asc ? 1 : -1
    // let smaller = asc ? -1 : 1
    let sortValues = Array.from(values)
    sortValues.sort((a: any, b: any): number => {
      // @ts-ignore
      return cmp(a[field], b[field], asc)
      // const aa = a[field] || 0
      // const bb = b[field] || 0
      // return aa > bb ? bigger : aa < bb ? smaller : 0
    })
    return sortValues
  }
  return values
}
