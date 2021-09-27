export function toUint8Array(data: ArrayBuffer | Uint8Array): Uint8Array {
  if (!(data instanceof Uint8Array)) return new Uint8Array(data)
  return data
}

/** Compare contents of binary arrays */
export function equalBinary(
  a: ArrayBuffer | Uint8Array,
  b: ArrayBuffer | Uint8Array
): boolean {
  if (a.byteLength !== b.byteLength) return false
  const aa = toUint8Array(a)
  const bb = toUint8Array(b)
  for (let i = 0; i < aa.length; i++) {
    if (aa[i] !== bb[i]) {
      return false
    }
  }
  return true
}
