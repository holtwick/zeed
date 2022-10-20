// Originial code at https://github.com/cryptocoinjs/base-x/blob/master/ts_src/index.ts
//
// base-x encoding / decoding
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

// "Fast base encoding / decoding of any given alphabet using bitcoin style leading zero compression."
// "WARNING: This module is NOT RFC3548 compliant, it cannot be used for base16 (hex), base32, or base64 encoding in a standards compliant manner."

import { Logger } from '../log'
import type { BinInput } from './bin'
import { toUint8Array } from './bin'

const log = Logger('zeed:basex')

const alphabets = {
  '2': '01',
  '8': '01234567',
  '11': '0123456789a',
  '16': '0123456789abcdef',
  '32': '0123456789abcdefghjkmnpqrtuvwxyz', // Agnoster, because least mix up and good sorting
  '32-crockford': '0123456789ABCDEFGHJKMNPQRSTVWXYZ', // Crockford
  '32-geohash': '0123456789bcdefghjkmnpqrstuvwxyz', // https://en.wikipedia.org/wiki/Base32#Geohash
  '32-agnoster': '0123456789abcdefghjkmnpqrtuvwxyz', // https://github.com/agnoster/base32-js/blob/master/lib/base32.js#L6 without i(1), l(1), o(0), s(5); keeps sort order
  '32-rfc': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', // https://datatracker.ietf.org/doc/html/rfc4648#section-6
  '32-hex': '0123456789ABCDEFGHIJKLMNOPQRSTUV', // https://datatracker.ietf.org/doc/html/rfc4648#section-7
  '32-zbase': 'ybndrfg8ejkmcpqxot1uwisza345h769', //  https://en.wikipedia.org/wiki/Base32#z-base-32
  '36': '0123456789abcdefghijklmnopqrstuvwxyz',
  '58': '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  '62': '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', // Correct sort order
  '64': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  '64-url': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', // https://datatracker.ietf.org/doc/html/rfc4648#section-5
  '66': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~',
  '85': '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~', // https://datatracker.ietf.org/doc/html/rfc1924#section-4.2
}

export function useBase(alphaOrBase: string | number) {
  let ALPHABET: string
  if (typeof alphaOrBase === 'string') {
    ALPHABET = alphaOrBase
  }
  else {
    // @ts-expect-error Only certain values
    ALPHABET = alphabets[String(alphaOrBase)]
    if (ALPHABET == null)
      throw new Error(`Unknown base ${alphaOrBase}`)
  }

  if (ALPHABET.length >= 255)
    throw new TypeError('Alphabet too long')

  const BASE_MAP = new Uint8Array(256)
  for (let j = 0; j < BASE_MAP.length; j++)
    BASE_MAP[j] = 255

  for (let i = 0; i < ALPHABET.length; i++) {
    const x = ALPHABET.charAt(i)
    const xc = x.charCodeAt(0)

    if (BASE_MAP[xc] !== 255)
      throw new TypeError(`${x} is ambiguous`)
    BASE_MAP[xc] = i
  }

  const BASE = ALPHABET.length
  const LEADER = ALPHABET.charAt(0)
  const FACTOR = Math.log(BASE) / Math.log(256) // log(BASE) / log(256), rounded up
  const iFACTOR = Math.log(256) / Math.log(BASE) // log(256) / log(BASE), rounded up

  function encode(source: BinInput, padToLength = -1): string {
    const data = toUint8Array(source)
    if (data.byteLength === 0)
      return ''

    // Skip & count leading zeroes.
    let length = 0
    let pbegin = 0
    const pend = data.byteLength

    while (pbegin !== pend && data[pbegin] === 0) pbegin++

    // Allocate enough space in big-endian base58 representation.
    const size = ((pend - pbegin) * iFACTOR + 1) >>> 0
    const dataEncoded = new Uint8Array(size)

    // Process the bytes.
    while (pbegin !== pend) {
      let carry = data[pbegin]

      // Apply "dataEncoded = dataEncoded * 256 + ch".
      let i = 0
      for (
        let it1 = size - 1;
        (carry !== 0 || i < length) && it1 !== -1;
        it1--, i++
      ) {
        carry += (256 * dataEncoded[it1]) >>> 0
        dataEncoded[it1] = carry % BASE >>> 0
        carry = (carry / BASE) >>> 0
      }

      if (carry !== 0) {
        log.warn('Non-zero carry', data, padToLength, i, size)
        throw new Error('Non-zero carry')
      }

      length = i
      pbegin++
    }

    let it2 = size - length

    // Skip leading zeroes
    while (it2 !== size && dataEncoded[it2] === 0) it2++

    // Translate the result into a string.
    let str = ''
    for (; it2 < size; ++it2) str += ALPHABET.charAt(dataEncoded[it2])

    if (padToLength > 0) {
      // const pad = Math.ceil(source.length * iFACTOR)
      return str.padStart(padToLength, LEADER)
    }
    return str
  }

  function decode(source: string, padToLength = -1): Uint8Array {
    if (typeof source !== 'string')
      throw new TypeError('Expected String')
    if (source.length === 0)
      return new Uint8Array()

    // Normalize
    source = source.replace(/\s+/gi, '')

    let psz = 0
    let length = 0

    while (source[psz] === LEADER) psz++

    // Allocate enough space in big-endian base256 representation.
    const size = ((source.length - psz) * FACTOR + 1) >>> 0 // log(58) / log(256), rounded up.
    const dataDecoded = new Uint8Array(size)

    // Process the characters.
    while (source[psz]) {
      let carry = BASE_MAP[source.charCodeAt(psz)]

      // Invalid character
      if (carry === 255)
        throw new Error(`Unsupported character "${source[psz]}"`)

      let i = 0
      for (
        let it3 = size - 1;
        (carry !== 0 || i < length) && it3 !== -1;
        it3--, i++
      ) {
        carry += (BASE * dataDecoded[it3]) >>> 0
        dataDecoded[it3] = carry % 256 >>> 0
        carry = (carry / 256) >>> 0
      }

      if (carry !== 0)
        throw new Error('Non-zero carry')
      length = i
      psz++
    }

    // Skip leading zeroes
    let it4 = size - length
    while (it4 !== size && dataDecoded[it4] === 0) it4++

    if (padToLength > 0) {
      return new Uint8Array([
        ...new Uint8Array(padToLength - dataDecoded.length + it4),
        ...dataDecoded.slice(it4),
      ])
    }

    return dataDecoded.slice(it4)
  }

  return {
    encode,
    decode,
  }
}

// Shortcuts

const { encode: encodeBase32, decode: _decodeBase32 } = useBase(32)

function decodeBase32(s: string) {
  return _decodeBase32(s
    .toLocaleLowerCase()
    .replaceAll('l', '1')
    .replaceAll('s', '5')
    .replaceAll('o', '0')
    .replaceAll('i', '1'))
}

export { encodeBase32, decodeBase32 }

export const { encode: encodeBase16, decode: decodeBase16 } = useBase(16)
export const { encode: encodeBase58, decode: decodeBase58 } = useBase(58)
export const { encode: encodeBase62, decode: decodeBase62 } = useBase(62)

// export const { encode: encodeBase32, decode: decodeBase32 } = useBase(32)
// export const { encode: encodeBase64, decode: decodeBase64 } = useBase(64)

export function estimateSizeForBase(bytes: number, base: number) {
  return Math.ceil(bytes * (Math.log(256) / Math.log(base)))
}
