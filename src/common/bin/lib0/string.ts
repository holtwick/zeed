/**
 * Original at https://github.com/dmonad/lib0
 *
 * Utility module to work with strings.
 */

export const fromCharCode = String.fromCharCode
export const fromCodePoint = String.fromCodePoint

const toLowerCase = (s: string): string => s.toLowerCase()

const trimLeftRegex = /^\s*/g

export const trimLeft = (s: string): string => s.replace(trimLeftRegex, '')

const fromCamelCaseRegex = /([A-Z])/g

export const fromCamelCase = (s: string, separator: string): string => trimLeft(s.replace(fromCamelCaseRegex, match => `${separator}${toLowerCase(match)}`))

/**
 * Compute the utf8ByteLength
 */
export const utf8ByteLength = (str: string): number => unescape(encodeURIComponent(str)).length

export const _encodeUtf8Polyfill = (str: string): Uint8Array => {
  const encodedString = unescape(encodeURIComponent(str))
  const len = encodedString.length
  const buf = new Uint8Array(len)
  for (let i = 0; i < len; i++)
    buf[i] = (encodedString.codePointAt(i) as number)

  return buf
}

export const utf8TextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder() : null)

export const _encodeUtf8Native = (str: string): Uint8Array => utf8TextEncoder!.encode(str) // todo

export const encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill

export const _decodeUtf8Polyfill = (buf: Uint8Array): string => {
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

// eslint-disable-next-line import/no-mutable-exports
export let utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })

if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
  // Safari doesn't handle BOM correctly.
  // This fixes a bug in Safari 13.0.5 where it produces a BOM the first time it is called.
  // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the first call and
  // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the second call
  // Another issue is that from then on no BOM chars are recognized anymore
  utf8TextDecoder = null
}

export const _decodeUtf8Native = (buf: Uint8Array): string => (utf8TextDecoder as TextDecoder).decode(buf)

export const decodeUtf8 = utf8TextDecoder ? _decodeUtf8Native : _decodeUtf8Polyfill

export const splice = (str: string, index: number, remove: number, insert = '') => str.slice(0, index) + insert + str.slice(index + remove)
