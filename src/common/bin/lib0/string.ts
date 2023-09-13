/**
 * Original at https://github.com/dmonad/lib0
 *
 * Utility module to work with strings.
 */

export const fromCharCode = String.fromCharCode
export const fromCodePoint = String.fromCodePoint

function toLowerCase(s: string): string {
  return s.toLowerCase()
}

const trimLeftRegex = /^\s*/g

export function trimLeft(s: string): string {
  return s.replace(trimLeftRegex, '')
}

const fromCamelCaseRegex = /([A-Z])/g

export function fromCamelCase(s: string, separator: string): string {
  return trimLeft(s.replace(fromCamelCaseRegex, match => `${separator}${toLowerCase(match)}`))
}

/**
 * Compute the utf8ByteLength
 */
export function utf8ByteLength(str: string): number {
  return unescape(encodeURIComponent(str)).length
}

export function _encodeUtf8Polyfill(str: string): Uint8Array {
  const encodedString = unescape(encodeURIComponent(str))
  const len = encodedString.length
  const buf = new Uint8Array(len)
  for (let i = 0; i < len; i++)
    buf[i] = (encodedString.codePointAt(i) as number)

  return buf
}

let utf8TextEncoder: TextEncoder | undefined | null

export function getUtf8TextEncoder(): TextEncoder | null {
  if (utf8TextEncoder === undefined)
    utf8TextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder() : null)
  return utf8TextEncoder
}

export function encodeUtf8(str: string): Uint8Array {
  return getUtf8TextEncoder()
    ? utf8TextEncoder!.encode(str)
    : _encodeUtf8Polyfill(str)
}

function _decodeUtf8Polyfill(buf: Uint8Array): string {
  let remainingLen = buf.length
  let encodedString = ''
  let bufPos = 0
  while (remainingLen > 0) {
    const nextLen = remainingLen < 10000 ? remainingLen : 10000
    const bytes = buf.subarray(bufPos, bufPos + nextLen)
    bufPos += nextLen
    // Starting with ES5.1 we can supply a generic array-like object as arguments
    encodedString += String.fromCodePoint.apply(null, (bytes as any))
    remainingLen -= nextLen
  }
  return decodeURIComponent(escape(encodedString))
}

let utf8TextDecoder: any

export function getUtf8TextDecoder(): TextDecoder | undefined {
  if (utf8TextDecoder === undefined) {
    utf8TextDecoder = (typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })) ?? null
    if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
      // Safari doesn't handle BOM correctly.
      // This fixes a bug in Safari 13.0.5 where it produces a BOM the first time it is called.
      // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the first call and
      // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the second call
      // Another issue is that from then on no BOM chars are recognized anymore
      utf8TextDecoder = null
    }
  }
  return utf8TextDecoder
}

export function decodeUtf8(buf: Uint8Array): string {
  return getUtf8TextDecoder()
    ? utf8TextDecoder.decode(buf)
    : _decodeUtf8Polyfill(buf)
}

export function splice(str: string, index: number, remove: number, insert = '') {
  return str.slice(0, index) + insert + str.slice(index + remove)
}
