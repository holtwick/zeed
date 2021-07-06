// base-x encoding / decoding
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

const alphabets = {
  "2": "01",
  "8": "01234567",
  "11": "0123456789a",
  "16": "0123456789abcdef",
  "32": "0123456789ABCDEFGHJKMNPQRSTVWXYZ",
  // "32": "ybndrfg8ejkmcpqxot1uwisza345h769", //  (z-base-32)
  "36": "0123456789abcdefghijklmnopqrstuvwxyz",
  "58": "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
  // "62": "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", // The sort order is not kept!
  "62": "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  "64": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  "66": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~",
}

export function useBase(alphaOrBase: string | number) {
  let ALPHABET: string
  if (typeof alphaOrBase === "string") {
    ALPHABET = alphaOrBase
  } else {
    // @ts-ignore
    ALPHABET = alphabets[alphaOrBase.toString()]
    if (ALPHABET == null) throw new Error(`Unknown base ${alphaOrBase}`)
  }

  if (ALPHABET.length >= 255) throw new TypeError("Alphabet too long")

  const BASE_MAP = new Uint8Array(256)
  for (let j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255
  }

  for (let i = 0; i < ALPHABET.length; i++) {
    const x = ALPHABET.charAt(i)
    const xc = x.charCodeAt(0)

    if (BASE_MAP[xc] !== 255) throw new TypeError(x + " is ambiguous")
    BASE_MAP[xc] = i
  }

  const BASE = ALPHABET.length
  const LEADER = ALPHABET.charAt(0)
  const FACTOR = Math.log(BASE) / Math.log(256) // log(BASE) / log(256), rounded up
  const iFACTOR = Math.log(256) / Math.log(BASE) // log(256) / log(BASE), rounded up

  function encode(
    source: number[] | Uint8Array,
    padToLength: number = -1
  ): string {
    if (source.length === 0) return ""

    // Skip & count leading zeroes.
    let length = 0
    let pbegin = 0
    const pend = source.length

    while (pbegin !== pend && source[pbegin] === 0) pbegin++

    // Allocate enough space in big-endian base58 representation.
    const size = ((pend - pbegin) * iFACTOR + 1) >>> 0
    const b58 = new Uint8Array(size)

    // Process the bytes.
    while (pbegin !== pend) {
      let carry = source[pbegin]

      // Apply "b58 = b58 * 256 + ch".
      let i = 0
      for (
        let it1 = size - 1;
        (carry !== 0 || i < length) && it1 !== -1;
        it1--, i++
      ) {
        carry += (256 * b58[it1]) >>> 0
        b58[it1] = carry % BASE >>> 0
        carry = (carry / BASE) >>> 0
      }

      if (carry !== 0) throw new Error("Non-zero carry")
      length = i
      pbegin++
    }

    let it2 = size - length

    // Skip leading zeroes in base58 result.
    while (it2 !== size && b58[it2] === 0) {
      it2++
    }

    // Translate the result into a string.
    let str = ""
    for (; it2 < size; ++it2) str += ALPHABET.charAt(b58[it2])

    if (padToLength > 0) {
      // const pad = Math.ceil(source.length * iFACTOR)
      return str.padStart(padToLength, LEADER)
    }
    return str
  }

  function decode(source: string, padToLength: number = -1): Uint8Array {
    if (typeof source !== "string") throw new TypeError("Expected String")
    if (source.length === 0) return new Uint8Array()

    // Normalize
    source = source.trim()

    let psz = 0
    let length = 0

    while (source[psz] === LEADER) {
      psz++
    }

    // Allocate enough space in big-endian base256 representation.
    const size = ((source.length - psz) * FACTOR + 1) >>> 0 // log(58) / log(256), rounded up.
    const b256 = new Uint8Array(size)

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
        carry += (BASE * b256[it3]) >>> 0
        b256[it3] = carry % 256 >>> 0
        carry = (carry / 256) >>> 0
      }

      if (carry !== 0) throw new Error("Non-zero carry")
      length = i
      psz++
    }

    // Skip leading zeroes
    let it4 = size - length
    while (it4 !== size && b256[it4] === 0) {
      it4++
    }

    if (padToLength > 0) {
      return new Uint8Array([
        ...new Uint8Array(padToLength - b256.length + it4),
        ...b256.slice(it4),
      ])
    }

    return b256.slice(it4)
  }

  return {
    encode,
    decode,
  }
}

// Shortcuts

export const { encode: encodeBase16, decode: decodeBase16 } = useBase(16)
export const { encode: encodeBase32, decode: decodeBase32 } = useBase(32)
export const { encode: encodeBase58, decode: decodeBase58 } = useBase(58)
export const { encode: encodeBase62, decode: decodeBase62 } = useBase(62)
