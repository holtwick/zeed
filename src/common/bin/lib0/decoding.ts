/**
 * Original at https://github.com/dmonad/lib0
 *
 * Efficient schema-less binary decoding with support for variable length encoding.
 *
 * Use [lib0/decoding] with [lib0/encoding]. Every encoding function has a corresponding decoding function.
 *
 * Encodes numbers in little-endian order (least to most significant byte order)
 * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
 * which is also used in Protocol Buffers.
 *
 * ```js
 * // encoding step
 * const encoder = new encoding.createEncoder()
 * encoding.writeVarUint(encoder, 256)
 * encoding.writeVarString(encoder, 'Hello world!')
 * const buf = encoding.toUint8Array(encoder)
 * ```
 *
 * ```js
 * // decoding step
 * const decoder = new decoding.createDecoder(buf)
 * decoding.readVarUint(decoder) // => 256
 * decoding.readVarString(decoder) // => 'Hello world!'
 * decoding.hasContent(decoder) // => false - all data is read
 * ```
 */

import * as buffer from './buffer'
import * as binary from './binary'
import * as number from './number'
import * as string from './string'

const errorUnexpectedEndOfArray = new Error('Unexpected end of array')
const errorIntegerOutOfRange = new Error('Integer out of Range')

/**
 * A Decoder handles the decoding of an Uint8Array.
 */
export class Decoder {
  /** Decoding target. */
  arr: Uint8Array
  /** Current decoding position. */
  pos: number

  constructor(uint8Array: Uint8Array) {
    this.arr = uint8Array
    this.pos = 0
  }
}

export const createDecoder = (uint8Array: Uint8Array): Decoder => new Decoder(uint8Array)

export const hasContent = (decoder: Decoder): boolean => decoder.pos !== decoder.arr.length

/**
 * Clone a decoder instance.
 * Optionally set a new position parameter.
 */
export const clone = (decoder: Decoder, newPos: number = decoder.pos): Decoder => {
  const _decoder = createDecoder(decoder.arr)
  _decoder.pos = newPos
  return _decoder
}

/**
 * Create an Uint8Array view of the next `len` bytes and advance the position by `len`.
 *
 * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
 *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
 */
export const readUint8Array = (decoder: Decoder, len: number): Uint8Array => {
  const view = buffer.createUint8ArrayViewFromArrayBuffer(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len)
  decoder.pos += len
  return view
}

/**
 * Read unsigned integer (32bit) with variable length.
 * 1/8th of the storage is used as encoding overhead.
 *  * numbers < 2^7 is stored in one bytlength
 *  * numbers < 2^14 is stored in two bylength
 */
export const readVarUint = (decoder: Decoder): number => {
  let num = 0
  let mult = 1
  const len = decoder.arr.length
  while (decoder.pos < len) {
    const r = decoder.arr[decoder.pos++]
    // num = num | ((r & binary.BITS7) << len)
    num = num + (r & binary.BITS7) * mult // shift $r << (7*#iterations) and add it to num
    mult *= 128 // next iteration, shift 7 "more" to the left
    if (r < binary.BIT8)
      return num

    /* istanbul ignore if */
    if (num > number.MAX_SAFE_INTEGER)
      throw errorIntegerOutOfRange
  }
  throw errorUnexpectedEndOfArray
}

/**
 * Read variable length Uint8Array.
 *
 * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
 *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
 */
export const readVarUint8Array = (decoder: Decoder): Uint8Array => readUint8Array(decoder, readVarUint(decoder))

/**
 * Read the rest of the content as an ArrayBuffer
 */
export const readTailAsUint8Array = (decoder: Decoder): Uint8Array => readUint8Array(decoder, decoder.arr.length - decoder.pos)

/**
 * Skip one byte, jump to the next position.
 */
export const skip8 = (decoder: Decoder): number => decoder.pos++

/**
 * Read one byte as unsigned integer.
 */
export const readUint8 = (decoder: Decoder): number => decoder.arr[decoder.pos++]

/**
 * Read 2 bytes as unsigned integer.
 */
export const readUint16 = (decoder: Decoder): number => {
  const uint
    = decoder.arr[decoder.pos]
    + (decoder.arr[decoder.pos + 1] << 8)
  decoder.pos += 2
  return uint
}

/**
 * Read 4 bytes as unsigned integer.
 */
export const readUint32 = (decoder: Decoder): number => {
  const uint
    = (decoder.arr[decoder.pos]
    + (decoder.arr[decoder.pos + 1] << 8)
    + (decoder.arr[decoder.pos + 2] << 16)
    + (decoder.arr[decoder.pos + 3] << 24)) >>> 0
  decoder.pos += 4
  return uint
}

/**
 * Read 4 bytes as unsigned integer in big endian order.
 * (most significant byte first)
 */
export const readUint32BigEndian = (decoder: Decoder): number => {
  const uint
    = (decoder.arr[decoder.pos + 3]
    + (decoder.arr[decoder.pos + 2] << 8)
    + (decoder.arr[decoder.pos + 1] << 16)
    + (decoder.arr[decoder.pos] << 24)) >>> 0
  decoder.pos += 4
  return uint
}

/**
 * Look ahead without incrementing the position
 * to the next byte and read it as unsigned integer.
 */
export const peekUint8 = (decoder: Decoder): number => decoder.arr[decoder.pos]

/**
 * Look ahead without incrementing the position
 * to the next byte and read it as unsigned integer.
 */
export const peekUint16 = (decoder: Decoder): number =>
  decoder.arr[decoder.pos]
  + (decoder.arr[decoder.pos + 1] << 8)

/**
 * Look ahead without incrementing the position
 * to the next byte and read it as unsigned integer.
 */
export const peekUint32 = (decoder: Decoder): number => (
  decoder.arr[decoder.pos]
  + (decoder.arr[decoder.pos + 1] << 8)
  + (decoder.arr[decoder.pos + 2] << 16)
  + (decoder.arr[decoder.pos + 3] << 24)
) >>> 0

/**
 * Read signed integer (32bit) with variable length.
 * 1/8th of the storage is used as encoding overhead.
 *  * numbers < 2^7 is stored in one bytlength
 *  * numbers < 2^14 is stored in two bylength
 * @todo This should probably create the inverse ~num if number is negative - but this would be a breaking change.
 */
export const readVarInt = (decoder: Decoder): number => {
  let r = decoder.arr[decoder.pos++]
  let num = r & binary.BITS6
  let mult = 64
  const sign = (r & binary.BIT7) > 0 ? -1 : 1
  if ((r & binary.BIT8) === 0) {
    // don't continue reading
    return sign * num
  }
  const len = decoder.arr.length
  while (decoder.pos < len) {
    r = decoder.arr[decoder.pos++]
    // num = num | ((r & binary.BITS7) << len)
    num = num + (r & binary.BITS7) * mult
    mult *= 128
    if (r < binary.BIT8)
      return sign * num

    /* istanbul ignore if */
    if (num > number.MAX_SAFE_INTEGER)
      throw errorIntegerOutOfRange
  }
  throw errorUnexpectedEndOfArray
}

/**
 * Look ahead and read varUint without incrementing position
 */
export const peekVarUint = (decoder: Decoder): number => {
  const pos = decoder.pos
  const s = readVarUint(decoder)
  decoder.pos = pos
  return s
}

/**
 * Look ahead and read varUint without incrementing position
 */
export const peekVarInt = (decoder: Decoder): number => {
  const pos = decoder.pos
  const s = readVarInt(decoder)
  decoder.pos = pos
  return s
}

/**
 * We don't test this function anymore as we use native decoding/encoding by default now.
 * Better not modify this anymore..
 *
 * Transforming utf8 to a string is pretty expensive. The code performs 10x better
 * when String.fromCodePoint is fed with all characters as arguments.
 * But most environments have a maximum number of arguments per functions.
 * For effiency reasons we apply a maximum of 10000 characters at once.
 */
export const _readVarStringPolyfill = (decoder: Decoder): string => {
  let remainingLen = readVarUint(decoder)
  if (remainingLen === 0) {
    return ''
  }
  else {
    let encodedString = String.fromCodePoint(readUint8(decoder)) // remember to decrease remainingLen
    if (--remainingLen < 100) { // do not create a Uint8Array for small strings
      while (remainingLen--)
        encodedString += String.fromCodePoint(readUint8(decoder))
    }
    else {
      while (remainingLen > 0) {
        const nextLen = remainingLen < 10000 ? remainingLen : 10000
        // this is dangerous, we create a fresh array view from the existing buffer
        const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen)
        decoder.pos += nextLen
        // Starting with ES5.1 we can supply a generic array-like object as arguments
        encodedString += String.fromCodePoint.apply(null, (bytes as any))
        remainingLen -= nextLen
      }
    }
    return decodeURIComponent(escape(encodedString))
  }
}

export const _readVarStringNative = (decoder: Decoder): string =>
  (string.utf8TextDecoder as any).decode(readVarUint8Array(decoder))

/**
 * Read string of variable length
 * * varUint is used to store the length of the string
 */
export const readVarString = string.utf8TextDecoder ? _readVarStringNative : _readVarStringPolyfill

/**
 * Look ahead and read varString without incrementing position
 */
export const peekVarString = (decoder: Decoder): string => {
  const pos = decoder.pos
  const s = readVarString(decoder)
  decoder.pos = pos
  return s
}

export const readFromDataView = (decoder: Decoder, len: number): DataView => {
  const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len)
  decoder.pos += len
  return dv
}

export const readFloat32 = (decoder: Decoder) => readFromDataView(decoder, 4).getFloat32(0, false)

export const readFloat64 = (decoder: Decoder) => readFromDataView(decoder, 8).getFloat64(0, false)

export const readBigInt64 = (decoder: Decoder) => /** @type {any} */ (readFromDataView(decoder, 8)).getBigInt64(0, false)

export const readBigUint64 = (decoder: Decoder) => /** @type {any} */ (readFromDataView(decoder, 8)).getBigUint64(0, false)

const readAnyLookupTable: Array<((arg0: Decoder) => any)> = [
  _ => undefined, // CASE 127: undefined
  _ => null, // CASE 126: null
  readVarInt, // CASE 125: integer
  readFloat32, // CASE 124: float32
  readFloat64, // CASE 123: float64
  readBigInt64, // CASE 122: bigint
  _ => false, // CASE 121: boolean (false)
  _ => true, // CASE 120: boolean (true)
  readVarString, // CASE 119: string
  (decoder) => { // CASE 118: object<string,any>
    const len = readVarUint(decoder)
    /**
     * @type {Object<string,any>}
     */
    const obj: { [s: string]: any } = {}
    for (let i = 0; i < len; i++) {
      const key = readVarString(decoder)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      obj[key] = readAny(decoder)
    }
    return obj
  },
  (decoder) => { // CASE 117: array<any>
    const len = readVarUint(decoder)
    const arr = []
    for (let i = 0; i < len; i++)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      arr.push(readAny(decoder))

    return arr
  },
  readVarUint8Array, // CASE 116: Uint8Array
]

export const readAny = (decoder: Decoder) => readAnyLookupTable[127 - readUint8(decoder)](decoder)
