import { randomUint8Array } from './crypto'
import { decodeBase32, decodeBase62, encodeBase32, encodeBase62 } from './data/basex'
import { fromHex, toHex, toUint8Array, Uint8ArrayToString } from './data/bin'
import { getTimestamp } from './time'

// 128 bit UUID

const uuidBytesLength = 16

/**
 * Generate raw UUID bytes (128 bits / 16 bytes).
 *
 * Uses a cryptographically secure random source provided by
 * `randomUint8Array`.
 *
 * @returns Uint8Array of length 16 with random bytes
 */
export function uuidBytes(): Uint8Array {
  return randomUint8Array(uuidBytesLength)
}

// Base62

/**
 * Create a Base62-encoded UUID string from the provided bytes or a newly
 * generated random UUID. The result is a compact, URL-safe identifier.
 *
 * @param bytes - optional 16-byte Uint8Array; if omitted a new random UUID is generated
 * @returns Base62 string representation (22 characters)
 */
export function uuidB62(bytes: Uint8Array = uuidBytes()): string {
  return encodeBase62(bytes, 22)
}

/**
 * Encode raw UUID bytes to a Base62 string.
 *
 * @param bytes - 16-byte UUID as Uint8Array
 * @returns Base62-encoded string
 */
export function uuidEncodeB62(bytes: Uint8Array): string {
  return encodeBase62(bytes, 22)
}

/**
 * Decode a Base62-encoded UUID string into raw bytes.
 *
 * @param uuid - Base62 string
 * @returns 16-byte Uint8Array
 */
export function uuidDecodeB62(uuid: string): Uint8Array {
  return decodeBase62(uuid, uuidBytesLength)
}

// Base32

/**
 * Create a Base32-encoded UUID string from bytes or a new random UUID.
 *
 * @param bytes - optional 16-byte Uint8Array; if omitted a new random UUID is generated
 * @returns Base32 string representation (26 characters)
 */
export function uuidB32(bytes: Uint8Array = uuidBytes()): string {
  return encodeBase32(bytes, 26)
}

/**
 * Encode raw UUID bytes to a Base32 string.
 *
 * @param bytes - 16-byte UUID as Uint8Array
 * @returns Base32-encoded string
 */
export function uuidEncodeB32(bytes: Uint8Array): string {
  return encodeBase32(bytes, 26)
}

/**
 * Decode a Base32-encoded UUID string into raw bytes.
 *
 * @param uuid - Base32 string
 * @returns 16-byte Uint8Array
 */
export function uuidDecodeB32(uuid: string): Uint8Array {
  return decodeBase32(uuid, uuidBytesLength)
}

// UUIDv4

// https://stackoverflow.com/a/2117523/140927
const pattern = '10000000-1000-4000-8000-100000000000' // String([1e7] + -1e3 + -4e3 + -8e3 + -1e11)

/**
 * Generate a UUID v4 string.
 *
 * Uses the native `crypto.randomUUID()` if available; otherwise falls back to
 * a random-based implementation using `randomUint8Array`.
 *
 * @returns UUID v4 string in standard 8-4-4-4-12 hex format
 */
export function uuidv4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID != null)
    return crypto.randomUUID() // native!

  // Fallback: generate 16 random bytes, set version and variant bits per RFC-4122
  const bytes = randomUint8Array(16)
  bytes[6] = (bytes[6] & 0x0F) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3F) | 0x80 // variant
  return uuidEncodeV4(bytes)
}

/**
 * Encode 16 raw bytes as a UUID v4 formatted string (hex with dashes).
 *
 * @param bytes - 16-byte Uint8Array
 * @returns UUID string (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
 */
export function uuidEncodeV4(bytes: Uint8Array): string {
  const id = toHex(bytes)
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}` // 10000000 - 1000 - 4000 - 8000 - 100000000000
}

/**
 * Decode a UUID v4 string (hex with dashes) into raw bytes.
 *
 * @param uuid - UUID string
 * @returns 16-byte Uint8Array
 */
export function uuidDecodeV4(uuid: string): Uint8Array {
  return fromHex(uuid.replace(/-/g, ''))
}

// Sortable UID

// https://github.com/segmentio/ksuid
// https://pkg.go.dev/github.com/rsms/go-uuid

/**
 * Sortable unique ID
 * Inspired by https://github.com/rsms/go-uuid
 *
 * Bytes 0-5:  Current time in miliseconds from 2021-06-01T00:00:00Z
 * Bytes 6-15: Random
 */

// 1622505600000 //  new Date('2021-06-01T00:00:00Z').getTime()
const ReferenceDateInMS = 1600000000000

// 6 bytes will stay valid until end of time: new Date(1622505600000 + 0xffffffffffff) === Date Sun Jan 01 10941 06:31:50 GMT+0100 (Central European Standard Time)

function longToByteArray(long: number) {
  const byteArray = new Uint8Array(6)
  for (let i = 5; i >= 0; i--) {
    byteArray[i] = long & 0xFF
    long = Math.floor(long / 256)
  }
  return byteArray
}

// function byteArrayToLong(byteArray: number[]): number {
//   var value = 0
//   for (var i = byteArray.length - 1; i >= 0; i--) {
//     value = value * 256 + byteArray[i]
//   }
//   return value
// }

/**
 * Create a sortable unique identifier (SUID) as raw bytes.
 *
 * The first 6 bytes encode a millisecond timestamp offset from an internal
 * reference date to allow lexicographic sorting by creation time. The
 * remaining 10 bytes are random.
 *
 * @returns 16-byte Uint8Array where bytes 0-5 are timestamp and 6-15 are random
 */
export function suidBytes(): Uint8Array {
  const ms = getTimestamp() - ReferenceDateInMS
  const out = new Uint8Array(16)
  out.set(longToByteArray(ms), 0)
  out.set(randomUint8Array(10), 6)
  return out
}

/**
 * Create a sortable unique identifier (SUID) and return it encoded using the
 * currently configured UUID encoding.
 *
 * @returns encoded SUID string
 */
export function suid(): string {
  return uuidEncode(suidBytes())
}

/**
 * Extract the creation Date from an encoded SUID string.
 *
 * @param id - encoded SUID
 * @returns Date corresponding to the timestamp component of the SUID
 */
export function suidDate(id: string): Date {
  return suidBytesDate(uuidDecode(id))
}

/**
 * Extract the creation Date from raw SUID bytes.
 *
 * @param id - 16-byte SUID as Uint8Array
 * @returns Date corresponding to the timestamp encoded in bytes 0-5
 */
export function suidBytesDate(id: Uint8Array): Date {
  return new Date(
    ReferenceDateInMS + id.slice(0, 6).reduce((acc, byte) => acc * 256 + byte, 0),
  )
}

// 32 bit UUID

/**
 * Generate a 32-bit unsigned integer from 4 random bytes.
 *
 * @returns a random 32-bit unsigned integer
 */
export function uuid32bit(): number {
  const bytes = randomUint8Array(4)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  return view.getUint32(0, false)
}

// Global Settings

const mapModes = {
  base62: {
    uuid: uuidB62,
    uuidDecode: uuidDecodeB62,
    uuidEncode: uuidEncodeB62,
  },
  base32: {
    uuid: uuidB32,
    uuidDecode: uuidDecodeB32,
    uuidEncode: uuidEncodeB32,
  },
  uuidv4: {
    uuid: uuidv4,
    uuidDecode: uuidDecodeV4,
    uuidEncode: uuidEncodeV4,
  },
  test: {
    uuid: (): string => uname('test'),
    uuidDecode: (id: string): Uint8Array => toUint8Array(id),
    uuidEncode: (bin: Uint8Array): string => Uint8ArrayToString(bin),
  },
}

let _mode: keyof typeof mapModes = 'base62'
let _sorted = false

/**
 * Configure the default encoding and whether generated IDs should be
 * lexicographically sortable.
 *
 * @param mode - encoding mode ('base62' | 'base32' | 'uuidv4' | 'test')
 * @param sorted - when true, `uuid()` will prefer sortable SUIDs
 */
export function setUuidDefaultEncoding(mode?: keyof typeof mapModes, sorted = false) {
  if (mode === 'test')
    unameReset('test')

  _mode = mode ?? 'base62'
  _sorted = sorted
}

/**
 * Generate an identifier using the current encoding mode.
 *
 * If the default encoding is configured with `sorted=true`, this returns a
 * sortable SUID; otherwise a random UUID is returned.
 *
 * @returns encoded identifier string
 */
export function uuid(): string {
  return mapModes[_mode].uuid(_sorted ? suidBytes() : uuidBytes())
}

/**
 * Decode an encoded identifier according to the current encoding mode into
 * raw bytes.
 *
 * @param uuid - encoded identifier string
 * @returns raw 16-byte Uint8Array
 */
export function uuidDecode(uuid: string): Uint8Array {
  return mapModes[_mode].uuidDecode(uuid)
}

/**
 * Encode raw UUID bytes using the current encoding mode.
 *
 * @param bytes - 16-byte Uint8Array
 * @returns encoded identifier string
 */
export function uuidEncode(bytes: Uint8Array): string {
  return mapModes[_mode].uuidEncode(bytes)
}

/**
 * Validate an encoded identifier by attempting to decode it and checking
 * for the expected byte length.
 *
 * @param uuid - encoded identifier string
 * @returns true when valid and decodes to 16 bytes
 */
export function uuidIsValid(uuid: string): boolean {
  try {
    const bin = uuidDecode(uuid)
    return bin.length === uuidBytesLength
  }
  catch (err) {
    // log.warn('Invalid ID:', uuid)
  }
  return false
}

// Simple Counters

const _unameCounters: Record<string, number> = {}

/**
 * Simple counter-based unique name generator.
 *
 * Returns strings like 'name-0', 'name-1', ... and increments an internal
 * counter per `name`.
 *
 * @param name - base name for the counter (default: 'id')
 * @returns generated unique name
 */
export function uname(name = 'id'): string {
  if (_unameCounters[name] == null)
    _unameCounters[name] = 0

  return `${name}-${_unameCounters[name]++}`
}

/** Reset the counter used by `uname` for the given name. */
export function unameReset(name = 'id') {
  _unameCounters[name] = 0
}

let _qid = 0

/**
 * Quick global incremental id generator.
 *
 * Returns strings like 'id-0', 'id-1', ... using a single global counter.
 */
export function qid(): string {
  return `id-${_qid++}`
}
