// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { randomUint8Array } from "./crypto"
import { useBase } from "./data/basex"
import { getTimestamp } from "./time"

const { encode: encode62, decode: decode62 } = useBase(62)
const { encode: encode32 } = useBase(32)

export function uuidBytes(): Uint8Array {
  return randomUint8Array(16)
}

export const uuid32bit = () => new Uint32Array(randomUint8Array(4))[0]

export function uuid(): string {
  return encode62(uuidBytes(), 22)
}

export function uuidEncode(bytes: Uint8Array): string {
  return encode62(bytes, 22)
}

export function uuidDecode(uuid: string): Uint8Array {
  return decode62(uuid, 16)
}

export function uuidB32(): string {
  return encode32(uuidBytes(), 26)
}

let _unameCounters: Record<string, number> = {}

export function uname(name: string = "id"): string {
  if (_unameCounters[name] == null) {
    _unameCounters[name] = 0
  }
  return `${name}-${_unameCounters[name]++}`
}

let _qid = 0

export function qid(): string {
  return `id-${_qid++}`
}

// https://stackoverflow.com/a/2117523/140927
const pattern = "10000000-1000-4000-8000-100000000000" // String([1e7] + -1e3 + -4e3 + -8e3 + -1e11)

export const uuidv4 = () =>
  pattern.replace(/[018]/g, (c: any) =>
    (c ^ (randomUint8Array(1)[0] & (15 >> (c / 4)))).toString(16)
  )

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
  var byteArray = new Uint8Array([0, 0, 0, 0, 0, 0])
  const bytes = byteArray.length - 1
  for (var index = 0; index < byteArray.length; index++) {
    var byte = long & 0xff
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
  return encode62(suidBytes(), 22)
}

export function suidDate(id: string): Date {
  return suidBytesDate(decode62(id, 16))
}

export function suidBytesDate(id: Uint8Array): Date {
  return new Date(
    ReferenceDateInMS +
      id.slice(0, 6).reduce((acc, byte) => {
        return acc * 256 + byte
      }, 0)
  )
}
