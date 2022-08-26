// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { useBase } from "./data/basex"
import { sleep } from "./exec/promise"
import {
  suid,
  suidBytesDate,
  suidDate,
  uname,
  uuid,
  uuid32bit,
  uuid32Decode,
  uuid32Encode,
  uuidB32,
  uuidBytes,
  uuidDecode,
  uuidDecodeV4,
  uuidEncode,
  uuidEncodeV4,
  uuidv4,
} from "./uuid"

describe("uuid", () => {
  it("should not certain length", () => {
    expect(uuid().length).toBe(22)
    expect(uuidB32().length).toBe(26)
  })

  it("should encode/decode", () => {
    let us = uuid()
    let ub = uuidDecode(us)
    expect(ub.length).toBe(16)
    expect(uuidEncode(ub)).toEqual(us)
  })

  it("should not have collisions", () => {
    let list = Array.apply(null, Array(100)).map(uuid)
    while (list.length) {
      let id = list.pop()
      expect(id?.length).toBe(22)
      expect(list).not.toContain(id)
    }
  })

  it("should not have collisions v4", () => {
    let list = Array.apply(null, Array(100)).map(uuidv4)
    while (list.length) {
      let id = list.pop()
      expect(id?.length).toBe(36)
      expect(list).not.toContain(id)
    }
  })

  it("should have nice uname", () => {
    expect(uname()).toBe("id-0")
    expect(uname()).toBe("id-1")
    expect(uname("me")).toBe("me-0")
    expect(uname()).toBe("id-2")
  })

  it("should create sortable ID", () => {
    // Create a suid
    let sample = suid()
    expect(sample).toHaveLength("000FcTTJiOtjzrDGJVhfoa".length) // === 22

    // Extract the date from the suid
    let dateSuid = new Uint8Array([
      0, 0, 141, 33, 250, 205, 174, 58, 31, 221, 187, 156, 31, 221, 187, 156,
    ])
    expect(suidBytesDate(dateSuid)).toEqual(
      new Date("2020-10-10T22:10:14.349Z")
    )

    //
    const { encode, decode } = useBase(62)

    expect(encode(dateSuid, 22)).toBe("000FcTTJiOtjzrDGJVhfoa")
    expect(decode("000FcTTJiOtjzrDGJVhfoa", 16)).toEqual(dateSuid)

    expect(decode("000FcTTJiOtjzrDGJVhfoa", 16)).toEqual(
      new Uint8Array([
        0, 0, 141, 33, 250, 205, 174, 58, 31, 221, 187, 156, 31, 221, 187, 156,
      ])
    )

    expect(suidDate("000FcTTJiOtjzrDGJVhfoa")).toEqual(
      new Date("2020-10-10T22:10:14.349Z")
    )
  })

  it("should sort correctly", async () => {
    // 0 < a < B
    expect("abc" < "ABC").toBe(false)
    expect("abc" > "ABC").toBe(true)
    expect("0" < "A").toBe(true)
    expect("0" < "a").toBe(true)
    expect("0" > "A").toBe(false)
    expect("0" > "a").toBe(false)

    let sample = [
      "012a",
      "0123B",
      "0123c",
      "aBC",
      "Abc",
      "abC",
      "aa",
      "aZ",
      "ay",
      "aB",
      "002ITJose",
      "002ITJoCh",
      "002ITJoch",
      "002ITJoSE",
    ]
    sample.sort()
    expect(sample).toEqual([
      "002ITJoCh",
      "002ITJoSE",
      "002ITJoch",
      "002ITJose",
      "0123B",
      "0123c",
      "012a",
      "Abc",
      "aB",
      "aBC",
      "aZ",
      "aa",
      "abC",
      "ay",
    ])
  })

  it("should evaluate demo", async () => {
    expect.assertions(100)
    for (let i = 0; i < 100; i++) {
      const shortSortableId = suid()
      await sleep(2)
      const nextSUID = suid()
      expect(shortSortableId < nextSUID).toBe(true)
    }
  })

  it("should generate 32bit", () => {
    expect(uuid32bit()).not.toBe(0)
    expect(Number.isSafeInteger(uuid32bit())).toBe(true)
  })

  it("should encode / decode 32", () => {
    const bytes = uuidBytes()
    const b32 = uuid32Encode(bytes)
    expect(b32).toHaveLength(26)
    expect(uuid32Decode(b32)).toEqual(bytes)
  })

  it("should encode / decode 62", () => {
    const bytes = uuidBytes()
    const b62 = uuidEncode(bytes)
    expect(b62).toHaveLength(22)
    expect(uuidDecode(b62)).toEqual(bytes)
  })

  it("should encode / decode 62 from string", () => {
    const id = uuid()
    expect(id).toHaveLength(22)
    const b62 = uuidDecode(id)
    expect(b62).toHaveLength(16)
    expect(uuidEncode(b62)).toEqual(id)
  })

  it("should encode / decode 62 by example", () => {
    const id = "78MQbFaILcblSYA7WS2OGE"
    expect(id).toHaveLength(22)
    const b62 = uuidDecode(id)
    expect(b62).toHaveLength(16)
    expect(b62).toMatchInlineSnapshot(`
      Uint8Array [
        234,
        109,
        230,
        115,
        91,
        247,
        195,
        211,
        119,
        255,
        157,
        220,
        65,
        184,
        26,
        190,
      ]
    `)
    expect(uuidEncode(b62)).toEqual("78MQbFaILcblSYA7WS2OGE")

    let uv4 = uuidEncodeV4(b62)
    expect(uv4).toEqual("ea6de673-5bf7-c3d3-77ff9ddc41b81abe")
    expect(uuidDecodeV4(uv4)).toEqual(b62)
  })
})
