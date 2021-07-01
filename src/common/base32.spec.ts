import {
  base32Encode,
  BASE62_ALPHABET,
  baseXEncode,
  byteArrayToLong,
  numberEncode,
} from "./base32"

describe("Base32", () => {
  it("should encode", () => {
    const buf = Buffer.from("Hello World")
    expect(Array.from(buf)).toEqual([
      72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100,
    ])
    expect(base32Encode(buf)).toBe("91JPRV3F41BPYWKCCG")
    expect(baseXEncode(buf)).toBe("91JPRV3F41BPYWKCCG")

    // Not tested!
    expect(baseXEncode(buf, BASE62_ALPHABET)).toBe("ApJ4xY0lRsd4w")
  })

  // ------ Experiments below ------

  // it("should arrays", () => {
  //   const buf = Buffer.from("Hello World")
  //   const arr = Array.from(buf)
  //   expect(arr).toEqual([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100])

  //   let long = byteArrayToLong(arr)
  //   expect(numberEncode(long)).toBe("")
  // })
})
