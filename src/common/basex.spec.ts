// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { useBase } from "./basex"

describe("BaseX", () => {
  it("should encode base16", () => {
    const { encode, decode } = useBase(16)
    expect(encode([0x01, 0x09, 0x0, 0xff])).toBe("10900ff")
    expect(decode("00010900ff")).toEqual(new Uint8Array([1, 9, 0, 255]))
  })

  it("should encode base62", () => {
    const { encode, decode } = useBase(62)
    expect(encode([0, 0x01, 0x09, 0x0, 0xff])).toBe("1As1f")
    expect(decode("01As1f")).toEqual(new Uint8Array([1, 9, 0, 255]))
  })

  it("should encode base62 carry", () => {
    const { encode, decode } = useBase(62)
    expect(encode([61])).toBe("z")
    expect(encode([62])).toBe("10")
    expect(decode("z")).toEqual(new Uint8Array([61]))
    expect(decode("0z")).toEqual(new Uint8Array([61]))
    expect(decode("10")).toEqual(new Uint8Array([62]))
  })

  it("should encode suid length", () => {
    const { encode, decode } = useBase(62)
    expect(
      encode([
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff,
      ])
    ).toBe("7n42DGM5Tflk9n8mt7Fhc7")

    expect(decode("7n42DGM5Tflk9n8mt7Fhc7")).toEqual(
      new Uint8Array([
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff,
      ])
    )

    expect(encode([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 22)).toBe(
      "0000000000000000000001"
    )

    expect(decode("0000000000000000000001", 16)).toEqual(
      new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1])
    )
  })

  it("should encode arraybuffer", () => {
    const { encode, decode } = useBase(62)
    let buf = Buffer.from([0, 0x01, 0x09, 0x0, 0xff])
    // let buf = new ArrayBuffer(5) // [0, 0x01, 0x09, 0x0, 0xff])
    expect(encode(buf)).toBe("1As1f")
    expect(decode("01As1f")).toEqual(new Uint8Array([1, 9, 0, 255]))
  })
})
