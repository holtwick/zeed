import { afterEach, vi } from 'vitest'
import { createDecoder, readAny, readVarInt as readVarIntDec, readVarString } from './decoding'
import { createBinEncoder, encodeToUint8Array, isNegativeZero, length, setUint8, setUint16, setUint32, verifyLen, writeAny, writeBigInt64, writeBigUint64, writeBinaryEncoder, writeFloat32, writeFloat64, writeUint8, writeUint8Array, writeUint16, writeUint32, writeUint32BigEndian, writeVarInt, writeVarString, writeVarUint, writeVarUint8Array } from './encoding'

describe('lib0/encoding', () => {
  it('should encode/decode uint8/16/32', () => {
    const e = createBinEncoder()
    writeUint8(e, 255)
    writeUint16(e, 0x1234)
    writeUint32(e, 0x12345678)
    writeUint32BigEndian(e, 0x12345678)
    const arr = encodeToUint8Array(e)
    expect(arr.length).toBe(11)
    expect(arr[0]).toBe(255)
    expect(arr[1] | (arr[2] << 8)).toBe(0x1234)
    expect(arr[3] | (arr[4] << 8) | (arr[5] << 16) | (arr[6] << 24)).toBe(0x12345678)
    expect(arr[7]).toBe(0x12)
    expect(arr[8]).toBe(0x34)
    expect(arr[9]).toBe(0x56)
    expect(arr[10]).toBe(0x78)
  })

  it('should set values at positions', () => {
    const e = createBinEncoder()
    writeUint8(e, 0)
    setUint8(e, 0, 42)
    expect(encodeToUint8Array(e)[0]).toBe(42)
    writeUint16(e, 0)
    setUint16(e, 1, 0x4321)
    expect(encodeToUint8Array(e)[1]).toBe(0x21)
    expect(encodeToUint8Array(e)[2]).toBe(0x43)
    writeUint32(e, 0)
    setUint32(e, 3, 0xDEADBEEF)
    const arr = encodeToUint8Array(e)
    // JS bitwise ops on 32-bit signed ints: 0xdeadbeef === -559038737
    expect(arr[3] | (arr[4] << 8) | (arr[5] << 16) | (arr[6] << 24)).toBe(-559038737)
  })

  it('should encode varuint/varint', () => {
    const e = createBinEncoder()
    writeVarUint(e, 300)
    writeVarInt(e, -123)
    const arr = encodeToUint8Array(e)
    expect(arr.length).toBeGreaterThan(0)
  })

  it('should encode strings and arrays', () => {
    const e = createBinEncoder()
    writeVarString(e, 'hello')
    writeVarUint8Array(e, new Uint8Array([1, 2, 3]))
    writeUint8Array(e, new Uint8Array([4, 5, 6]))
    const arr = encodeToUint8Array(e)
    expect(arr.length).toBeGreaterThan(0)
  })

  it('should encode floats and bigints', () => {
    const e = createBinEncoder()
    writeFloat32(e, 1.5)
    writeFloat64(e, 2.5)
    writeBigInt64(e, BigInt(-123456789012345))
    writeBigUint64(e, BigInt(123456789012345))
    const arr = encodeToUint8Array(e)
    expect(arr.length).toBe(4 + 8 + 8 + 8)
  })

  it('should encode any type', () => {
    const e = createBinEncoder()
    writeAny(e, undefined)
    writeAny(e, null)
    writeAny(e, 42)
    writeAny(e, 3.14)
    writeAny(e, BigInt(123))
    writeAny(e, true)
    writeAny(e, false)
    writeAny(e, 'str')
    writeAny(e, [1, 2, 3])
    writeAny(e, new Uint8Array([1, 2, 3]))
    writeAny(e, { a: 1, b: 2 })
    const arr = encodeToUint8Array(e)
    expect(arr.length).toBeGreaterThan(0)
  })

  it('should detect negative zero', () => {
    expect(isNegativeZero(-0)).toBe(true)
    expect(isNegativeZero(0)).toBe(false)
    expect(isNegativeZero(1)).toBe(false)
    expect(isNegativeZero(-1)).toBe(true)
  })

  it('grows buffers when exceeding initial capacity', () => {
    const e = createBinEncoder()
    for (let i = 0; i < 250; i++) writeUint8(e, i & 0xFF)
    expect(length(e)).toBe(250)
    expect(e.bufs.length).toBeGreaterThan(0)
    const arr = encodeToUint8Array(e)
    expect(arr.length).toBe(250)
    expect(arr[0]).toBe(0)
    expect(arr[249]).toBe(249 & 0xFF)
  })

  it('verifyLen allocates a fresh buffer when required', () => {
    const e = createBinEncoder()
    writeUint8(e, 1)
    verifyLen(e, 200)
    expect(e.bufs.length).toBe(1)
    writeUint8(e, 2)
    const arr = encodeToUint8Array(e)
    expect(arr[0]).toBe(1)
    expect(arr[1]).toBe(2)
  })

  it('set updates bytes across multiple buffers', () => {
    const e = createBinEncoder()
    for (let i = 0; i < 250; i++) writeUint8(e, 0)
    setUint8(e, 0, 0xAA)
    setUint8(e, 120, 0xBB)
    setUint8(e, 240, 0xCC)
    const arr = encodeToUint8Array(e)
    expect(arr[0]).toBe(0xAA)
    expect(arr[120]).toBe(0xBB)
    expect(arr[240]).toBe(0xCC)
  })

  it('writeUint8Array splits across buffers', () => {
    const e = createBinEncoder()
    writeUint8(e, 9)
    const data = new Uint8Array(300)
    for (let i = 0; i < data.length; i++) data[i] = i & 0xFF
    writeUint8Array(e, data)
    const arr = encodeToUint8Array(e)
    expect(arr.length).toBe(301)
    expect(arr[0]).toBe(9)
    expect(arr[1]).toBe(0)
    expect(arr[300]).toBe(299 & 0xFF)
  })

  it('writeBinaryEncoder appends another encoder', () => {
    const inner = createBinEncoder()
    writeUint8(inner, 1)
    writeUint8(inner, 2)
    const outer = createBinEncoder()
    writeUint8(outer, 0)
    writeBinaryEncoder(outer, inner)
    const arr = encodeToUint8Array(outer)
    expect([...arr]).toEqual([0, 1, 2])
  })

  it('writes long strings via alternate path', () => {
    const e = createBinEncoder()
    const big = 'z'.repeat(15000)
    writeVarString(e, big)
    const arr = encodeToUint8Array(e)
    const d = createDecoder(arr)
    expect(readVarString(d)).toBe(big)
  })

  it('writeVarInt handles multi-byte large values', () => {
    const e = createBinEncoder()
    writeVarInt(e, 1_000_000)
    writeVarInt(e, -1_000_000)
    const arr = encodeToUint8Array(e)
    const d = createDecoder(arr)
    expect(readVarIntDec(d)).toBe(1_000_000)
    expect(readVarIntDec(d)).toBe(-1_000_000)
  })

  it('writeAny encodes float32-representable numbers compactly', () => {
    const e = createBinEncoder()
    writeAny(e, 0.5)
    const arr = encodeToUint8Array(e)
    expect(arr[0]).toBe(124)
    const d = createDecoder(arr)
    expect(readAny(d)).toBe(0.5)
  })

  describe('polyfill path', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
      vi.resetModules()
    })

    it('writeVarString via polyfill when TextEncoder missing', async () => {
      vi.stubGlobal('TextEncoder', undefined)
      vi.stubGlobal('TextDecoder', undefined)
      vi.resetModules()
      const enc = await import('./encoding')
      const dec = await import('./decoding')
      const e = enc.createBinEncoder()
      enc.writeVarString(e, 'hi✓')
      const arr = enc.encodeToUint8Array(e)
      const d = dec.createDecoder(arr)
      expect(dec.readVarString(d)).toBe('hi✓')
    })
  })
})
