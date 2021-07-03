import { useBaseX } from "./basex"

const alphabets = {
  "2": "01",
  "8": "01234567",
  "11": "0123456789a",
  "16": "0123456789abcdef",
  "32": "0123456789ABCDEFGHJKMNPQRSTVWXYZ",
  // "32": "ybndrfg8ejkmcpqxot1uwisza345h769", //  (z-base-32)
  "36": "0123456789abcdefghijklmnopqrstuvwxyz",
  "58": "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
  "62": "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "64": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  "66": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~",
}

describe("BaseX", () => {
  it("should encode base16", () => {
    const { encode, decode } = useBaseX(alphabets["16"])
    expect(encode([0x01, 0x09, 0x0, 0xff])).toBe("010900ff")
    expect(decode("00010900ff")).toEqual(new Uint8Array([0, 1, 9, 0, 255]))
  })

  it("should encode base62", () => {
    const { encode, decode } = useBaseX(alphabets["62"])
    expect(encode([0, 0x01, 0x09, 0x0, 0xff])).toBe("01aS1F")
    expect(decode("01aS1F")).toEqual(new Uint8Array([0, 1, 9, 0, 255]))
  })

  it("should encode base62 carry", () => {
    const { encode, decode } = useBaseX(alphabets["62"])
    expect(encode([61])).toBe("Z")
    expect(encode([62])).toBe("10")
    expect(decode("Z")).toEqual(new Uint8Array([61]))
    expect(decode("0Z")).toEqual(new Uint8Array([0, 61]))
    expect(decode("10")).toEqual(new Uint8Array([0, 62]))
  })

  it("should encode base62 suid length", () => {
    const { encode, decode } = useBaseX(alphabets["62"])
    expect(
      encode([
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff,
      ])
    ).toBe("7N42dgm5tFLK9N8MT7fHC7")

    expect(decode("7N42dgm5tFLK9N8MT7fHC7")).toEqual(
      new Uint8Array([
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff,
      ])
    )

    expect(encode([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(
      "0000000000000000000000"
    )

    expect(decode("0000000000000000000000")).toEqual(
      new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    )
  })
})
