import { Uint8ArrayToHexDump, toHex } from '..'
import { bitfield, createBinaryStreamDecoder, createBinaryStreamEncoder } from '.'

describe('encoder', () => {
  it('should write a stream', () => {
    const stream = createBinaryStreamEncoder()

    stream.writeUint32(1)
    stream.write({ a: '99' })
    stream.writeBytes([1, 2, 3], 3)
    stream.write(123)

    const bin = stream.getUint8Array()

    expect(Uint8ArrayToHexDump(bin)).toMatchInlineSnapshot(`
      "0000  01 00 00 00 76 01 01 61 77 02 39 39 01 02 03 7D  ....v..aw.99...}
      0010  BB 01                                            ».              "
    `)

    expect(stream.getLength()).toBe(18)

    const readStream = createBinaryStreamDecoder(bin)
    expect(readStream.getOffset()).toBe(0)
    expect(readStream.readUint32()).toBe(1)
    expect(readStream.getOffset()).toBe(4)
    expect(readStream.read()).toEqual({ a: '99' })
    expect(readStream.readBytes(3)).toMatchInlineSnapshot(`
Uint8Array [
  1,
  2,
  3,
]
`)
    expect(readStream.read()).toBe(123)
    expect(readStream.getOffset()).toBe(bin.length)
  })

  it('should bitfield', () => {
    const bf = bitfield(1)
    bf.setBit(4)
    expect(bf.getValue()).toBe(0b10001)
    bf.setBit(0, false)
    expect(bf.getValue()).toBe(0b10000)
    bf.setBit(1)
    bf.setBit(5)
    bf.setBit(16)
    expect(bf.getValue().toString(2)).toMatchInlineSnapshot(
      '"10000000000110010"',
    )
    expect(bf.getValue()).toBe(0b10000000000110010)
    expect(bf.getBit(0)).toBe(false)
    expect(bf.getBit(4)).toBe(true)
    bf.toggleBit(4)
    expect(bf.getBit(4)).toBe(false)
    expect(bf.getValue()).toBe(0b10000000000100010)
  })

  it('should var bin', () => {
    function enc(v: number) {
      const e = createBinaryStreamEncoder()
      e.writeIntVar(v)
      return toHex(e.getUint8Array())
    }

    expect(enc(1)).toMatchInlineSnapshot('"01"')
    expect(enc(128)).toMatchInlineSnapshot('"8002"')
    expect(enc(-1)).toMatchInlineSnapshot('"41"')
    expect(enc(-691529286)).toMatchInlineSnapshot('"c699bf9305"')
    expect(enc(691529286)).toMatchInlineSnapshot('"8699bf9305"')
  })

  it('should var bin uint', () => {
    function enc(v: number) {
      const e = createBinaryStreamEncoder()
      e.writeUintVar(v)
      return toHex(e.getUint8Array())
    }

    expect(enc(1)).toMatchInlineSnapshot('"01"')
    expect(enc(127)).toMatchInlineSnapshot('"7f"')
    expect(enc(128)).toMatchInlineSnapshot(`"8001"`)
    expect(enc(255)).toMatchInlineSnapshot('"ff01"')
    expect(enc(256)).toMatchInlineSnapshot('"8002"')
    expect(enc(691529286)).toMatchInlineSnapshot('"c6ccdfc902"')
  })
})
