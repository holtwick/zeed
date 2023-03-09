import type { Encoder } from '../msg/encoder'
import { assertCondition } from '../assert'
import type { BinInput } from '../data/bin'
import { toUint8Array } from '../data/bin'
import { createEncoder, encodeToUint8Array, length, writeAny, writeFloat32, writeUint16, writeUint32, writeUint8, writeUint8Array, writeVarInt, writeVarString, writeVarUint, writeVarUint8Array } from './lib0/encoding'
import { createDecoder, readAny, readFloat32, readUint16, readUint32, readUint8, readUint8Array, readVarInt, readVarString, readVarUint, readVarUint8Array } from './lib0/decoding'

// Use in Zeed channels

export class BinaryEncoder implements Encoder {
  async encode(data: any): Promise<Uint8Array> {
    const dataEncoder = createEncoder()
    writeAny(dataEncoder, data)
    return encodeToUint8Array(dataEncoder)
  }

  async decode(data: Uint8Array | ArrayBuffer): Promise<any> {
    return readAny(createDecoder(toUint8Array(data)))
  }
}

// Json like

/** Encode any object, including Uint8Array data */
export function encodeJson(data: any): Uint8Array {
  const dataEncoder = createEncoder()
  writeAny(dataEncoder, data)
  return encodeToUint8Array(dataEncoder)
}

/** Decode any object, including Uint8Array data */
export function decodeJson(data: Uint8Array | ArrayBuffer): any {
  return readAny(createDecoder(toUint8Array(data)))
}

// Stream like

/** Incrementally encode binary data */
export function createBinaryStreamEncoder(initialData?: BinInput) {
  const dataEncoder = createEncoder()

  if (initialData != null)
    writeUint8Array(dataEncoder, toUint8Array(initialData))

  return {
    /** Just writes the bytes. Length is not stored! */
    writeBytes: (data: BinInput, expectedLength: number) => {
      const bin = toUint8Array(data)
      assertCondition(!(expectedLength != null && bin.length !== expectedLength), `Expected ${expectedLength} bytes, got ${bin.length}`)
      writeUint8Array(dataEncoder, bin)
    },
    writeBytesVar: (data: BinInput) => writeVarUint8Array(dataEncoder, toUint8Array(data)),
    writeUintVar: (data: number) => writeVarUint(dataEncoder, data),
    writeUint8: (data: number) => writeUint8(dataEncoder, data),
    writeUint16: (data: number) => writeUint16(dataEncoder, data),
    writeUint32: (data: number) => writeUint32(dataEncoder, data),
    writeIntVar: (data: number) => writeVarInt(dataEncoder, data),
    writeFloat: (data: number) => writeFloat32(dataEncoder, data),
    writeStringVar: (data: string) => writeVarString(dataEncoder, data),
    write: (data: any) => writeAny(dataEncoder, data),
    getUint8Array: (): Uint8Array => encodeToUint8Array(dataEncoder),
    getLength: () => length(dataEncoder),
  }
}

/** Incrementally decode binary data */
export function createBinaryStreamDecoder(data: BinInput) {
  const dataDecoder = createDecoder(toUint8Array(data))
  return {
    readBytes: (len: number): Uint8Array => readUint8Array(dataDecoder, len),
    readBytesVar: (): Uint8Array => readVarUint8Array(dataDecoder),
    readUintVar: (): number => readVarUint(dataDecoder),
    readUint8: (): number => readUint8(dataDecoder),
    readUint16: (): number => readUint16(dataDecoder),
    readUint32: (): number => readUint32(dataDecoder),
    readIntVar: (): number => readVarInt(dataDecoder),
    readFloat: (): number => readFloat32(dataDecoder),
    readStringVar: (): string => readVarString(dataDecoder),
    read: (): any => readAny(dataDecoder),
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
