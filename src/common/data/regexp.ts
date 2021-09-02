const rxEscape = /[\-\[\]\/{}()*+?.^$|]/g

export function escapeRegExp(value: RegExp | string): string {
  if (!value) return ""
  if (value instanceof RegExp) {
    return value.source
  }
  return value.replace(rxEscape, "\\$&")
}
