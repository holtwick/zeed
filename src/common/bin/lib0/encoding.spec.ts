import { createBinEncoder, encodeToUint8Array, isNegativeZero, setUint8, setUint16, setUint32, writeAny, writeBigInt64, writeBigUint64, writeFloat32, writeFloat64, writeUint8, writeUint8Array, writeUint16, writeUint32, writeUint32BigEndian, writeVarInt, writeVarString, writeVarUint, writeVarUint8Array } from './encoding'

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
})
