/**
 * Original at https://github.com/dmonad/lib0
 *
 * Utility functions to work with buffers (Uint8Array).
 */

import { createDecoder, readAny } from './decoding'
import { createBinEncoder, encodeToUint8Array, writeAny } from './encoding'

export function createUint8ArrayFromLen(len: number) {
  return new Uint8Array(len)
}

/**
 * Copy the content of an Uint8Array view to a new ArrayBuffer.
 */
export function copyUint8Array(uint8Array: Uint8Array): Uint8Array {
  const newBuf = createUint8ArrayFromLen(uint8Array.byteLength)
  newBuf.set(uint8Array)
  return newBuf
}

/**
 * Encode anything as a UInt8Array. It's a pun on typescripts's `any` type.
 * See encoding.writeAny for more information.
 */
export function encodeAny(data: any): Uint8Array {
  const encoder = createBinEncoder()
  writeAny(encoder, data)
  return encodeToUint8Array(encoder)
}

/**
 * Decode an any-encoded value.
 */
export function decodeAny(buf: Uint8Array): any {
  return readAny(createDecoder(buf))
}
