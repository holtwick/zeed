/**
 * Original at https://github.com/dmonad/lib0
 *
 * Efficient schema-less binary encoding with support for variable length encoding.
 *
 * Use [lib0/encoding] with [lib0/decoding]. Every encoding function has a corresponding decoding function.
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

import { BIT7, BIT8, BITS6, BITS7, BITS8, BITS31 } from './binary'
import { createUint8ArrayViewFromArrayBuffer } from './create'
import { encodeUtf8, getUtf8TextEncoder } from './string'

/**
 * A BinaryEncoder handles the encoding to an Uint8Array.
 */
export class BinEncoder {
  cpos: number
  cbuf: Uint8Array
  bufs: Uint8Array[]

  constructor() {
    this.cpos = 0
    this.cbuf = new Uint8Array(100)
    this.bufs = []
  }
}

export function createBinEncoder(): BinEncoder {
  return new BinEncoder()
}

/**
 * The current length of the encoded data.
 */
export function length(encoder: BinEncoder): number {
  let len = encoder.cpos
  for (let i = 0; i < encoder.bufs.length; i++)
    len += encoder.bufs[i].length

  return len
}

/**
 * Transform to Uint8Array.
 */
export function encodeToUint8Array(encoder: BinEncoder): Uint8Array {
  const uint8arr = new Uint8Array(length(encoder))
  let curPos = 0
  for (let i = 0; i < encoder.bufs.length; i++) {
    const d = encoder.bufs[i]
    uint8arr.set(d, curPos)
    curPos += d.length
  }
  uint8arr.set(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos), curPos)
  return uint8arr
}

/**
 * Verify that it is possible to write `len` bytes wtihout checking. If
 * necessary, a new Buffer with the required length is attached.
 */
export function verifyLen(encoder: BinEncoder, len: number) {
  const bufferLen = encoder.cbuf.length
  if (bufferLen - encoder.cpos < len) {
    encoder.bufs.push(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos))
    encoder.cbuf = new Uint8Array(Math.max(bufferLen, len) * 2)
    encoder.cpos = 0
  }
}

/**
 * Write one byte to the encoder.
 */
export function write(encoder: BinEncoder, num: number) {
  const bufferLen = encoder.cbuf.length
  if (encoder.cpos === bufferLen) {
    encoder.bufs.push(encoder.cbuf)
    encoder.cbuf = new Uint8Array(bufferLen * 2)
    encoder.cpos = 0
  }
  encoder.cbuf[encoder.cpos++] = num
}

/**
 * Write one byte at a specific position.
 * Position must already be written (i.e. encoder.length > pos)
 */
export function set(encoder: BinEncoder, pos: number, num: number) {
  let buffer = null
  // iterate all buffers and adjust position
  for (let i = 0; i < encoder.bufs.length && buffer === null; i++) {
    const b = encoder.bufs[i]
    if (pos < b.length)
      buffer = b // found buffer

    else
      pos -= b.length
  }
  if (buffer === null) {
    // use current buffer
    buffer = encoder.cbuf
  }
  buffer[pos] = num
}

/**
 * Write one byte as an unsigned integer.
 */
export const writeUint8 = write

/**
 * Write one byte as an unsigned Integer at a specific location.
 */
export const setUint8 = set

/**
 * Write two bytes as an unsigned integer.
 */
export function writeUint16(encoder: BinEncoder, num: number) {
  write(encoder, num & BITS8)
  write(encoder, (num >>> 8) & BITS8)
}
/**
 * Write two bytes as an unsigned integer at a specific location.
 */
export function setUint16(encoder: BinEncoder, pos: number, num: number) {
  set(encoder, pos, num & BITS8)
  set(encoder, pos + 1, (num >>> 8) & BITS8)
}

/**
 * Write two bytes as an unsigned integer
 */
export function writeUint32(encoder: BinEncoder, num: number) {
  for (let i = 0; i < 4; i++) {
    write(encoder, num & BITS8)
    num >>>= 8
  }
}

/**
 * Write two bytes as an unsigned integer in big endian order.
 * (most significant byte first)
 */
export function writeUint32BigEndian(encoder: BinEncoder, num: number) {
  for (let i = 3; i >= 0; i--)
    write(encoder, (num >>> (8 * i)) & BITS8)
}

/**
 * Write two bytes as an unsigned integer at a specific location.
 */
export function setUint32(encoder: BinEncoder, pos: number, num: number) {
  for (let i = 0; i < 4; i++) {
    set(encoder, pos + i, num & BITS8)
    num >>>= 8
  }
}

/**
 * Write a variable length unsigned integer. Max encodable integer is 2^53.
 */
export function writeVarUint(encoder: BinEncoder, num: number) {
  while (num > BITS7) {
    write(encoder, BIT8 | (BITS7 & num))
    num = Math.floor(num / 128) // shift >>> 7
  }
  write(encoder, BITS7 & num)
}

export function isNegativeZero(n: number) {
  return n !== 0 ? n < 0 : 1 / n < 0
}

/**
 * Write a variable length integer.
 *
 * We use the 7th bit instead for signaling that this is a negative number.
 */
export function writeVarInt(encoder: BinEncoder, num: number) {
  const isNegative = isNegativeZero(num)
  if (isNegative)
    num = -num

  //             |- whether to continue reading         |- whether is negative     |- number
  write(encoder, (num > BITS6 ? BIT8 : 0) | (isNegative ? BIT7 : 0) | (BITS6 & num))
  num = Math.floor(num / 64) // shift >>> 6

  // We don't need to consider the case of num === 0 so we can use a different
  // pattern here than above.
  while (num > 0) {
    write(encoder, (num > BITS7 ? BIT8 : 0) | (BITS7 & num))
    num = Math.floor(num / 128) // shift >>> 7
  }
}

/**
 * Append fixed-length Uint8Array to the encoder.
 */
export function writeUint8Array(encoder: BinEncoder, uint8Array: Uint8Array) {
  const bufferLen = encoder.cbuf.length
  const cpos = encoder.cpos
  const leftCopyLen = Math.min(bufferLen - cpos, uint8Array.length)
  const rightCopyLen = uint8Array.length - leftCopyLen
  encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos)
  encoder.cpos += leftCopyLen
  if (rightCopyLen > 0) {
    // Still something to write, write right half..
    // Append new buffer
    encoder.bufs.push(encoder.cbuf)
    // must have at least size of remaining buffer
    encoder.cbuf = new Uint8Array(Math.max(bufferLen * 2, rightCopyLen))
    // copy array
    encoder.cbuf.set(uint8Array.subarray(leftCopyLen))
    encoder.cpos = rightCopyLen
  }
}

/**
 * Append an Uint8Array to BinEncoder.
 */
export function writeVarUint8Array(encoder: BinEncoder, uint8Array: Uint8Array): void {
  writeVarUint(encoder, uint8Array.byteLength)
  writeUint8Array(encoder, uint8Array)
}

/**
 * A cache to store strings temporarily
 */
let _strBuffer: Uint8Array
let _maxStrBSize: number

/**
 * Write a variable length string.
 */
function _writeVarStringNative(encoder: BinEncoder, str: string) {
  if (_strBuffer == null) {
    _strBuffer = new Uint8Array(30000)
    _maxStrBSize = _strBuffer.length / 3
  }

  if (str.length < _maxStrBSize) {
    // We can encode the string into the existing buffer
    const written = getUtf8TextEncoder()!.encodeInto(str, _strBuffer).written || 0
    writeVarUint(encoder, written)
    for (let i = 0; i < written; i++)
      write(encoder, _strBuffer[i])
  }
  else {
    writeVarUint8Array(encoder, encodeUtf8(str))
  }
}

/**
 * Write a variable length string.
 */
function _writeVarStringPolyfill(encoder: BinEncoder, str: string) {
  const encodedString = unescape(encodeURIComponent(str))
  const len = encodedString.length
  writeVarUint(encoder, len)
  for (let i = 0; i < len; i++)
    write(encoder, (encodedString.codePointAt(i) as number))
}

/**
 * Write a variable length string.
 */
export function writeVarString(encoder: BinEncoder, str: string) {
  return getUtf8TextEncoder()?.encodeInto
    ? _writeVarStringNative(encoder, str)
    : _writeVarStringPolyfill(encoder, str)
}

/**
 * Write the content of another Encoder.
 *
 * @TODO: can be improved!
 *        - Note: Should consider that when appending a lot of small Encoders, we should rather clone than referencing the old structure.
 *                Encoders start with a rather big initial buffer.
 */
export function writeBinaryEncoder(encoder: BinEncoder, append: BinEncoder) {
  return writeUint8Array(encoder, encodeToUint8Array(append))
}

/**
 * Create an DataView of the next `len` bytes. Use it to write data after
 * calling this function.
 *
 * ```js
 * // write float32 using DataView
 * const dv = writeOnDataView(encoder, 4)
 * dv.setFloat32(0, 1.1)
 * // read float32 using DataView
 * const dv = readFromDataView(encoder, 4)
 * dv.getFloat32(0) // => 1.100000023841858 (leaving it to the reader to find out why this is the correct result)
 * ```
 */
export function writeOnDataView(encoder: BinEncoder, len: number): DataView {
  verifyLen(encoder, len)
  const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len)
  encoder.cpos += len
  return dview
}

export function writeFloat32(encoder: BinEncoder, num: number) {
  return writeOnDataView(encoder, 4).setFloat32(0, num, false)
}

export function writeFloat64(encoder: BinEncoder, num: number) {
  return writeOnDataView(encoder, 8).setFloat64(0, num, false)
}

export function writeBigInt64(encoder: BinEncoder, num: bigint) {
  return (writeOnDataView(encoder, 8)).setBigInt64(0, num, false)
}

export function writeBigUint64(encoder: BinEncoder, num: bigint) {
  return (writeOnDataView(encoder, 8)).setBigUint64(0, num, false)
}

let floatTestBed: DataView

/**
 * Check if a number can be encoded as a 32 bit float.
 */
function isFloat32(num: number): boolean {
  if (floatTestBed == null)
    floatTestBed = new DataView(new ArrayBuffer(4))
  floatTestBed.setFloat32(0, num)
  return floatTestBed.getFloat32(0) === num
}

/**
 * Encode data with efficient binary format.
 *
 * Differences to JSON:
 * • Transforms data to a binary format (not to a string)
 * • Encodes undefined, NaN, and ArrayBuffer (these can't be represented in JSON)
 * • Numbers are efficiently encoded either as a variable length integer, as a
 *   32 bit float, as a 64 bit float, or as a 64 bit bigint.
 *
 * Encoding table:
 *
 * | Data Type           | Prefix   | Encoding Method    | Comment |
 * | ------------------- | -------- | ------------------ | ------- |
 * | undefined           | 127      |                    | Functions, symbol, and everything that cannot be identified is encoded as undefined |
 * | null                | 126      |                    | |
 * | integer             | 125      | writeVarInt        | Only encodes 32 bit signed integers |
 * | float32             | 124      | writeFloat32       | |
 * | float64             | 123      | writeFloat64       | |
 * | bigint              | 122      | writeBigInt64      | |
 * | boolean (false)     | 121      |                    | True and false are different data types so we save the following byte |
 * | boolean (true)      | 120      |                    | - 0b01111000 so the last bit determines whether true or false |
 * | string              | 119      | writeVarString     | |
 * | object<string,any>  | 118      | custom             | Writes {length} then {length} key-value pairs |
 * | array<any>          | 117      | custom             | Writes {length} then {length} json values |
 * | Uint8Array          | 116      | writeVarUint8Array | We use Uint8Array for any kind of binary data |
 *
 * Reasons for the decreasing prefix:
 * We need the first bit for extendability (later we may want to encode the
 * prefix with writeVarUint). The remaining 7 bits are divided as follows:
 * [0-30]   the beginning of the data range is used for custom purposes
 *          (defined by the function that uses this library)
 * [31-127] the end of the data range is used for data encoding by
 *          lib0/encoding.js
 */
export function writeAny(encoder: BinEncoder, data: undefined | null | number | bigint | boolean | string | { [s: string]: any } | Array<any> | Uint8Array) {
  switch (typeof data) {
    case 'string':
      // TYPE 119: STRING
      write(encoder, 119)
      writeVarString(encoder, data)
      break
    case 'number':
      if (Number.isInteger(data) && Math.abs(data) <= BITS31) {
        // TYPE 125: INTEGER
        write(encoder, 125)
        writeVarInt(encoder, data)
      }
      else if (isFloat32(data)) {
        // TYPE 124: FLOAT32
        write(encoder, 124)
        writeFloat32(encoder, data)
      }
      else {
        // TYPE 123: FLOAT64
        write(encoder, 123)
        writeFloat64(encoder, data)
      }
      break
    case 'bigint':
      // TYPE 122: BigInt
      write(encoder, 122)
      writeBigInt64(encoder, data)
      break
    case 'object':
      if (data === null) {
        // TYPE 126: null
        write(encoder, 126)
      }
      else if (Array.isArray(data)) {
        // TYPE 117: Array
        write(encoder, 117)
        writeVarUint(encoder, data.length)
        for (let i = 0; i < data.length; i++)
          writeAny(encoder, data[i])
      }
      else if (data instanceof Uint8Array) {
        // TYPE 116: ArrayBuffer
        write(encoder, 116)
        writeVarUint8Array(encoder, data)
      }
      else {
        // TYPE 118: Object
        write(encoder, 118)
        const keys = Object.keys(data)
        keys.sort() // guarantee comparability and consistency
        writeVarUint(encoder, keys.length)
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          writeVarString(encoder, key)
          writeAny(encoder, data[key])
        }
      }
      break
    case 'boolean':
      // TYPE 120/121: boolean (true/false)
      write(encoder, data ? 120 : 121)
      break
    default:
      // TYPE 127: undefined
      write(encoder, 127)
  }
}
