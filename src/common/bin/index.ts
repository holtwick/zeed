import type { BinInput } from '../data/bin'
import { toUint8Array } from '../data/bin'
import type { Encoder } from '../msg/encoder'
import { assertCondition } from '../assert'
import * as encoding from './lib0/encoding'
import * as decoding from './lib0/decoding'

// Use in Zeed channels

export class BinaryEncoder implements Encoder {
  async encode(data: any): Promise<Uint8Array> {
    const dataEncoder = encoding.createEncoder()
    encoding.writeAny(dataEncoder, data)
    return encoding.toUint8Array(dataEncoder)
  }

  async decode(data: Uint8Array | ArrayBuffer): Promise<any> {
    return decoding.readAny(decoding.createDecoder(toUint8Array(data)))
  }
}

// Json like

/** Encode any object, including Uint8Array data */
export function encodeJson(data: any): Uint8Array {
  const dataEncoder = encoding.createEncoder()
  encoding.writeAny(dataEncoder, data)
  return encoding.toUint8Array(dataEncoder)
}

/** Decode any object, including Uint8Array data */
export function decodeJson(data: Uint8Array | ArrayBuffer): any {
  return decoding.readAny(decoding.createDecoder(toUint8Array(data)))
}

// Stream like

/** Incrementally encode binary data */
export function createBinaryStreamEncoder(initialData?: BinInput) {
  const dataEncoder = encoding.createEncoder()

  if (initialData != null)
    encoding.writeUint8Array(dataEncoder, toUint8Array(initialData))

  return {
    /** Just writes the bytes. Length is not stored! */
    writeBytes: (data: BinInput, expectedLength: number) => {
      const bin = toUint8Array(data)
      assertCondition(!(expectedLength != null && bin.length !== expectedLength), `Expected ${expectedLength} bytes, got ${bin.length}`)
      encoding.writeUint8Array(dataEncoder, bin)
    },
    writeBytesVar: (data: BinInput) => encoding.writeVarUint8Array(dataEncoder, toUint8Array(data)),
    writeUintVar: (data: number) => encoding.writeVarUint(dataEncoder, data),
    writeUint8: (data: number) => encoding.writeUint8(dataEncoder, data),
    writeUint16: (data: number) => encoding.writeUint16(dataEncoder, data),
    writeUint32: (data: number) => encoding.writeUint32(dataEncoder, data),
    writeIntVar: (data: number) => encoding.writeVarInt(dataEncoder, data),
    writeFloat: (data: number) => encoding.writeFloat32(dataEncoder, data),
    writeStringVar: (data: string) => encoding.writeVarString(dataEncoder, data),
    write: (data: any) => encoding.writeAny(dataEncoder, data),
    getUint8Array: (): Uint8Array => encoding.toUint8Array(dataEncoder),
    getLength: () => encoding.length(dataEncoder),
  }
}

/** Incrementally decode binary data */
export function createBinaryStreamDecoder(data: BinInput) {
  const dataDecoder = decoding.createDecoder(toUint8Array(data))
  return {
    readBytes: (len: number): Uint8Array => decoding.readUint8Array(dataDecoder, len),
    readBytesVar: (): Uint8Array => decoding.readVarUint8Array(dataDecoder),
    readUintVar: (): number => decoding.readVarUint(dataDecoder),
    readUint8: (): number => decoding.readUint8(dataDecoder),
    readUint16: (): number => decoding.readUint16(dataDecoder),
    readUint32: (): number => decoding.readUint32(dataDecoder),
    readIntVar: (): number => decoding.readVarInt(dataDecoder),
    readFloat: (): number => decoding.readFloat32(dataDecoder),
    readStringVar: (): string => decoding.readVarString(dataDecoder),
    read: (): any => decoding.readAny(dataDecoder),
    getOffset: (): number => dataDecoder.pos || 0,
  }
}

// https://stackoverflow.com/a/1436448/140927
export function bitfield(bitfield = 0) {
  return {
    setBit: (bit: number, value = true): number => value ? (bitfield |= 1 << bit) : (bitfield &= ~(1 << bit)),
    unsetBit: (bit: number): number => (bitfield &= 1 << bit),
    toggleBit: (bit: number): number => (bitfield ^= 1 << bit),
    getBit: (bit: number): boolean => (bitfield & (1 << bit)) !== 0,
    getValue: () => bitfield,
  }
}

// Cast

export async function blobToArrayBuffer(blob: Blob | File): Promise<ArrayBuffer | undefined> {
  return await blob.arrayBuffer()
  // try {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       const reader = new FileReader()
  //       reader.onloadend = () => resolve(reader.result as ArrayBuffer)
  //       reader.onerror = err => reject(err)
  //       reader.onabort = err => reject(err)
  //       reader.readAsArrayBuffer(blob)
  //     }
  //     catch (err) {
  //       reject(err)
  //     }
  //   })
  // }
  // catch (err) {}
}

export async function blobToUint8Array(blob: Blob | File): Promise<Uint8Array | undefined> {
  const buffer = await blobToArrayBuffer(blob)
  if (buffer != null)
    return toUint8Array(buffer)
}
