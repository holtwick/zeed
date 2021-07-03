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
  it("should encode base62", () => {
    {
      const { encode, decode } = useBaseX(alphabets["16"])
      expect(encode([0x01, 0x09, 0x0, 0xff])).toBe("10900ff")
      expect(decode("10900ff")).toEqual(new Uint8Array([1, 9, 0, 255]))
    }
    {
      const { encode, decode } = useBaseX(alphabets["62"])
      expect(encode([0x01, 0x09, 0x0, 0xff])).toBe("1aS1F")
      expect(decode("1aS1F")).toEqual(new Uint8Array([1, 9, 0, 255]))
    }
    // const buf = Buffer.from("Hello World")
    // expect(Array.from(buf)).toEqual([
    //   72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100,
    // ])
    // expect(base32Encode(buf)).toBe("91JPRV3F41BPYWKCCG")
    // expect(baseXEncode(buf)).toBe("91JPRV3F41BPYWKCCG")
    // // Not tested!
    // expect(baseXEncode(buf, BASE62_ALPHABET)).toBe("ApJ4xY0lRsd4w")
  })
})
