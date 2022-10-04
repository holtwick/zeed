/* eslint-disable no-control-regex */
/* eslint-disable prefer-spread */

import { Logger } from '../log'
import { jsonStringifySafe } from './json'

const log = Logger('zeed:bin')

export type BinInput = Uint8Array | ArrayBuffer | string | number[]

// From https://github.com/dmonad/lib0/blob/main/string.js#L44

export function _encodeUtf8Polyfill(str: string): Uint8Array {
  const encodedString = unescape(encodeURIComponent(str))
  const len = encodedString.length
  const buf = new Uint8Array(len)
  for (let i = 0; i < len; i++)
    buf[i] = encodedString.codePointAt(i) || 0

  return buf
}

export function _decodeUtf8Polyfill(buf: Uint8Array) {
  let remainingLen = buf.length
  let encodedString = ''
  let bufPos = 0
  while (remainingLen > 0) {
    const nextLen = remainingLen < 10000 ? remainingLen : 10000
    const bytes = buf.subarray(bufPos, bufPos + nextLen)
    bufPos += nextLen
    // Starting with ES5.1 we can supply a generic array-like object as arguments
    // @ts-expect-error xxx
    encodedString += String.fromCodePoint.apply(null, bytes)
    remainingLen -= nextLen
  }
  return decodeURIComponent(escape(encodedString))
}

let _textEncoder: (data: string) => Uint8Array

export function stringToUInt8Array(text: string): Uint8Array {
  if (_textEncoder == null) {
    _textEncoder = _encodeUtf8Polyfill
    if (typeof TextEncoder !== 'undefined') {
      const encoder = new TextEncoder()
      _textEncoder = data => encoder.encode(data)
    }
  }
  return _textEncoder(text.normalize('NFC'))
}

let _textDecoder: (data: Uint8Array) => string

export function Uint8ArrayToString(bin: Uint8Array): string {
  if (_textDecoder == null) {
    _textDecoder = _decodeUtf8Polyfill
    if (typeof TextDecoder !== 'undefined') {
      const decoder = new TextDecoder('utf-8', { ignoreBOM: true })
      _textDecoder = data => decoder.decode(data)
    }
  }
  return _textDecoder(bin).normalize('NFC')
}

export function toUint8Array(data: BinInput): Uint8Array {
  if (data instanceof ArrayBuffer)
    return new Uint8Array(data)
  if (typeof data === 'string')
    return stringToUInt8Array(data)
  if (data.length)
    return new Uint8Array(data)
  // @ts-expect-error xxx
  return data
}

export function joinToUint8Array(...args: BinInput[] | BinInput[][]) {
  let length = 0
  const bins = args.flat(1).map((d) => {
    const b = toUint8Array(d as BinInput)
    length += b.length
    return b
  })
  const bin = new Uint8Array(length)
  let cursor = 0
  for (const b of bins) {
    bin.set(b, cursor)
    cursor += b.length
  }
  return bin
}

export function toHex(bin: BinInput): string {
  if (typeof Buffer !== 'undefined')
    return Buffer.from(toUint8Array(bin)).toString('hex')

  const h = '0123456789abcdef'
  let s = ''
  for (const v of [...toUint8Array(bin)])
    s += h[v >> 4] + h[v & 15]

  return s
}

export function fromHex(hexString: string): Uint8Array {
  return Uint8Array.from(
    hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)),
  )
}

export function toBase64(bin: BinInput): string {
  const bytes = toUint8Array(bin)
  if (typeof Buffer !== 'undefined')
    return Buffer.from(bytes).toString('base64')

  let s = ''
  for (let i = 0; i < bytes.byteLength; i++)
    s += String.fromCharCode(bytes[i])

  return btoa(s)
}

export function toBase64Url(bin: BinInput): string {
  const bytes = toUint8Array(bin)
  if (typeof Buffer !== 'undefined')
    return Buffer.from(bytes).toString('base64url')

  let s = ''
  for (let i = 0; i < bytes.byteLength; i++)
    s += String.fromCharCode(bytes[i])

  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_')
}

export function fromBase64(s: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(s, 'base64')
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  }
  const a = atob(s)
  const bytes = new Uint8Array(a.length)
  for (let i = 0; i < a.length; i++)
    bytes[i] = a.charCodeAt(i)

  return bytes
}

/** Compare contents of binary arrays */
export function equalBinary(
  a: ArrayBuffer | Uint8Array,
  b: ArrayBuffer | Uint8Array,
): boolean {
  if (a.byteLength !== b.byteLength)
    return false
  const aa = toUint8Array(a)
  const bb = toUint8Array(b)
  for (let i = 0; i < aa.length; i++) {
    if (aa[i] !== bb[i])
      return false
  }
  return true
}

export function jsonToUint8Array(json: any): Uint8Array | never {
  try {
    return stringToUInt8Array(jsonStringifySafe(json))
  }
  catch (err) {
    log.warn('jsonToUint8Array', json)
    throw err
  }
}

export function Uint8ArrayToJson<T = any>(data: Uint8Array): T | never {
  try {
    return JSON.parse(Uint8ArrayToString(data))
  }
  catch (err) {
    log.warn('Uint8ArrayToJson', data)
    throw err
  }
}

// https://gist.github.com/igorgatis/d294fe714a4f523ac3a3
export function Uint8ArrayToHexDump(
  buffer: Uint8Array | ArrayBuffer | String | Array<number>,
  blockSize?: number,
) {
  if (typeof buffer === 'string') {
    // log("buffer is string")
    // do nothing
  }
  else if (buffer instanceof ArrayBuffer && buffer.byteLength !== undefined) {
    // log("buffer is ArrayBuffer")
    buffer = String.fromCharCode.apply(
      String,
      [].slice.call(new Uint8Array(buffer)),
    )
  }
  else if (Array.isArray(buffer)) {
    // log("buffer is Array")
    buffer = String.fromCharCode.apply(String, buffer)
  }
  else if (buffer.constructor === Uint8Array) {
    // log("buffer is Uint8Array")
    buffer = String.fromCharCode.apply(String, [].slice.call(buffer))
  }
  else {
    // log("Error: buffer is unknown...")
    return false
  }

  blockSize = blockSize || 16
  const lines = []
  const hex = '0123456789ABCDEF'
  for (let b = 0; b < buffer.length; b += blockSize) {
    const block = buffer.slice(b, Math.min(b + blockSize, buffer.length))
    const addr = (`0000${b.toString(16)}`).slice(-4)
    let codes = block
      .split('')
      .map((ch: any) => {
        const code = ch.charCodeAt(0)
        return ` ${hex[(0xF0 & code) >> 4]}${hex[0x0F & code]}`
      })
      .join('')
    codes += '   '.repeat(blockSize - block.length)
    let chars = block.replace(/[\x00-\x1F\x20]/g, '.')
    chars += ' '.repeat(blockSize - block.length)
    lines.push(`${addr} ${codes}  ${chars}`)
  }
  return lines.join('\n')
}
