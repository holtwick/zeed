export type BinInput = Uint8Array | ArrayBuffer | string

export function stringToUInt8Array(text: string): Uint8Array {
  return new TextEncoder().encode(text.normalize("NFC"))
}

export function UInt8ArrayToString(bin: Uint8Array): string {
  return new TextDecoder().decode(bin).normalize("NFC")
}

export function toUint8Array(data: BinInput): Uint8Array {
  if (data instanceof ArrayBuffer) return new Uint8Array(data)
  if (typeof data === "string") return stringToUInt8Array(data)
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
