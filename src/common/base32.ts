// https://www.crockford.com/base32.html
// https://github.com/LinusU/base32-encode/blob/master/index.js

export const BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
// const alphabet = '0123456789abcdefghjkmnpqrstvwxyz'
export const BASE62_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

export function base32Encode(
  buffer: Buffer | ArrayBuffer,
  characterOutputLength: number = -1
): string {
  // @ts-ignore
  let length = buffer.length || buffer.byteLength
  let view = new Uint8Array(buffer)

  let bits = 0
  let value = 0
  let output = ""

  for (let i = 0; i < length; i++) {
    value = (value << 8) | view[i]
    bits += 8

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5

      if (characterOutputLength >= 0) {
        if (output.length >= characterOutputLength) {
          return output
        }
      }
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }

  return output
}

export function baseXEncode(
  buffer: Buffer | ArrayBuffer,
  alphabet = BASE32_ALPHABET,
  characterOutputLength: number = -1
): string {
  // @ts-ignore
  let length = buffer.length || buffer.byteLength
  let view = new Uint8Array(buffer)

  const alphabetMask = alphabet.length - 1
  const bitLimit = Math.floor(Math.sqrt(alphabet.length))

  let bits = 0
  let value = 0
  let output = ""

  for (let i = 0; i < length; i++) {
    value = (value << 8) | view[i]
    bits += 8

    while (bits >= bitLimit) {
      output += alphabet[(value >>> (bits - bitLimit)) & alphabetMask]
      bits -= bitLimit

      if (characterOutputLength >= 0) {
        if (output.length >= characterOutputLength) {
          return output
        }
      }
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (bitLimit - bits)) & alphabetMask]
  }

  return output
}

// ------ Experiments below ------

// https://stackoverflow.com/a/12965194/140927

export function longToByteArray(long: number): number[] {
  var byteArray = [0, 0, 0, 0, 0, 0]
  const bytes = byteArray.length - 1
  for (var index = 0; index < byteArray.length; index++) {
    var byte = long & 0xff
    byteArray[bytes - index] = byte
    long = (long - byte) / 256
  }
  return byteArray
}

export function byteArrayToLong(byteArray: number[]): number {
  var value = 0
  for (var i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i]
  }
  return value
}

// https://lowrey.me/encoding-decoding-base-62-in-es6-javascript/

export function numberEncode(
  integer: number,
  alphabet = BASE32_ALPHABET
): string {
  const alphabetLength = alphabet.length
  let s: string[] = []
  while (integer > 0) {
    s = [alphabet[integer % alphabetLength], ...s]
    integer = Math.floor(integer / alphabetLength)
  }
  return s.join("")
}

export function numberDecode(
  chars: string,
  alphabet = BASE32_ALPHABET
): number {
  const alphabetLength = alphabet.length
  return chars
    .split("")
    .reverse()
    .reduce(
      (prev, curr, i) => prev + alphabet.indexOf(curr) * alphabetLength ** i,
      0
    )
}
