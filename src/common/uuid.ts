// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { randomUint8Array } from './crypto'
import { fromHex, toHex } from './data'
import { useBase } from './data/basex'
import { getTimestamp } from './time'

const { encode: encode62, decode: decode62 } = useBase(62)
const { encode: encode32, decode: decode32 } = useBase(32)

// 128 bit UUID

const uuidBytesLength = 16

export function uuidBytes(): Uint8Array {
  return randomUint8Array(uuidBytesLength)
}

// Base62

export function uuidB62(bytes = uuidBytes()): string {
  return encode62(bytes, 22)
}

export function uuidEncodeB62(bytes: Uint8Array): string {
  return encode62(bytes, 22)
}

export function uuidDecodeB62(uuid: string): Uint8Array {
  return decode62(uuid, uuidBytesLength)
}

// Base32

export function uuidB32(bytes = uuidBytes()): string {
  return encode32(bytes, 26)
}

export function uuidEncodeB32(bytes: Uint8Array): string {
  return encode32(bytes, 26)
}

export function uuidDecodeB32(uuid: string): Uint8Array {
  return decode32(uuid, uuidBytesLength)
}

// UUIDv4

// https://stackoverflow.com/a/2117523/140927
const pattern = '10000000-1000-4000-8000-100000000000' // String([1e7] + -1e3 + -4e3 + -8e3 + -1e11)

export const uuidv4 = typeof crypto !== 'undefined' && crypto.randomUUID != null
  ? crypto.randomUUID.bind(crypto) // native!
  : () => pattern.replace(/[018]/g, (c: any) => (c ^ (randomUint8Array(1)[0] & (15 >> (c / 4)))).toString(16))

export function uuidEncodeV4(bytes: Uint8Array): string {
  const id = toHex(bytes)
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16)}` // 10000000 - 1000 - 4000 - 8000 - 100000000000
}

export function uuidDecodeV4(uuid: string): Uint8Array {
  return fromHex(uuid.replaceAll('-', ''))
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
  const byteArray = new Uint8Array([0, 0, 0, 0, 0, 0])
  const bytes = byteArray.length - 1
  for (let index = 0; index < byteArray.length; index++) {
    const byte = long & 0xFF
    byteArray[bytes - index] = byte
    long = (long - byte) / 256
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

export function suidBytes(): Uint8Array {
  const ms = getTimestamp() - ReferenceDateInMS
  return new Uint8Array([...longToByteArray(ms), ...randomUint8Array(10)])
}

export function suid(): string {
  return uuidEncode(suidBytes())
}

export function suidDate(id: string): Date {
  return suidBytesDate(uuidDecode(id))
}

export function suidBytesDate(id: Uint8Array): Date {
  return new Date(
    ReferenceDateInMS + id.slice(0, 6).reduce((acc, byte) => acc * 256 + byte, 0),
  )
}

// 32 bit UUID

export const uuid32bit = () => new Uint32Array(randomUint8Array(4))[0]

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
}

let _mode: keyof typeof mapModes = 'base62'
let _sorted = false

export function setUuidDefaultEncoding(mode: keyof typeof mapModes, sorted = false) {
  _mode = mode
  _sorted = sorted
}

export function uuid(): string {
  return mapModes[_mode].uuid(_sorted ? suidBytes() : uuidBytes())
}

export function uuidDecode(uuid: string): Uint8Array {
  return mapModes[_mode].uuidDecode(uuid)
}

export function uuidEncode(bytes: Uint8Array): string {
  return mapModes[_mode].uuidEncode(bytes)
}

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

export function uname(name = 'id'): string {
  if (_unameCounters[name] == null)
    _unameCounters[name] = 0

  return `${name}-${_unameCounters[name]++}`
}

let _qid = 0

export function qid(): string {
  return `id-${_qid++}`
}
