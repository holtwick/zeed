import { Logger } from "../log"

const log = Logger("bin")

export type BinInput = Uint8Array | ArrayBuffer | string | number[]

// if (typeof TextEncoder !== "undefined") {

let _textEncoder: TextEncoder | undefined
export function stringToUInt8Array(text: string): Uint8Array {
  if (typeof TextEncoder === "undefined") return new Uint8Array()
  const textEncoder = _textEncoder ?? (_textEncoder = new TextEncoder())
  return textEncoder.encode(text.normalize("NFC"))
}

let _textDecoder: TextDecoder | undefined
export function Uint8ArrayToString(bin: Uint8Array): string {
  if (typeof TextDecoder === "undefined") return ""
  const textDecoder =
    _textDecoder ??
    (_textDecoder = new TextDecoder("utf-8", { ignoreBOM: true }))
  return textDecoder.decode(bin).normalize("NFC")
}

export function toUint8Array(data: BinInput): Uint8Array {
  if (data instanceof ArrayBuffer) return new Uint8Array(data)
  if (typeof data === "string") return stringToUInt8Array(data)
  if (data.length) return new Uint8Array(data)
  // @ts-ignore
  return data
}

export function toHex(bin: BinInput): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(toUint8Array(bin)).toString("hex")
  }
  const h = "0123456789abcdef"
  let s = ""
  for (const v of [...toUint8Array(bin)]) {
    s += h[v >> 4] + h[v & 15]
  }
  return s
}

export function toBase64(bin: BinInput): string {
  const bytes = toUint8Array(bin)
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64")
  }
  let s = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    s += String.fromCharCode(bytes[i])
  }
  return btoa(s)
}

export function toBase64Url(bin: BinInput): string {
  const bytes = toUint8Array(bin)
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url")
  }
  let s = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    s += String.fromCharCode(bytes[i])
  }
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_")
}

export function fromBase64(s: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(s, "base64")
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  }
  const a = atob(s)
  const bytes = new Uint8Array(a.length)
  for (let i = 0; i < a.length; i++) {
    bytes[i] = a.charCodeAt(i)
  }
  return bytes
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

export function jsonToUint8Array(json: any): Uint8Array | never {
  try {
    return stringToUInt8Array(JSON.stringify(json))
  } catch (err) {
    log.warn("jsonToUint8Array", json)
    throw err
  }
}

export function Uint8ArrayToJson<T = any>(data: Uint8Array): T | never {
  try {
    return JSON.parse(Uint8ArrayToString(data))
  } catch (err) {
    log.warn("Uint8ArrayToJson", data)
    throw err
  }
}
