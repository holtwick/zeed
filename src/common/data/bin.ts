/** Compare contents of binary arrays */
export function equalBinary(
  a: ArrayBuffer | Uint8Array,
  b: ArrayBuffer | Uint8Array
): boolean {
  if (a.byteLength !== b.byteLength) {
    return false
  }

  if (!(a instanceof Uint8Array)) a = new Uint8Array(a)
  if (!(b instanceof Uint8Array)) b = new Uint8Array(b)

  const aa = a as Uint8Array
  const bb = b as Uint8Array
  for (let i = 0; i < aa.length; i++) {
    if (aa[i] !== bb[i]) {
      return false
    }
  }

  return true
}
