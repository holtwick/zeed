// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { useBase } from "./data/basex"
import { suid, suidBytesDate, suidDate, uname, uuid, uuidB32 } from "./uuid"
import { sleep } from "./promise"

test("should not certain length", () => {
  expect(uuid().length).toBe(22)
  expect(uuidB32().length).toBe(26)
})

test("should not have collisions", () => {
  let list = Array.apply(null, Array(100)).map(uuid)
  // console.log(list)
  while (list.length) {
    let id = list.pop()
    expect(list).not.toContain(id)
  }
})

test("should have nice uname", () => {
  expect(uname()).toBe("id-0")
  expect(uname()).toBe("id-1")
  expect(uname("me")).toBe("me-0")
  expect(uname()).toBe("id-2")
})

test("should create sortable ID", () => {
  // Create a suid
  let sample = suid()
  expect(sample).toHaveLength("000FcTTJiOtjzrDGJVhfoa".length) // === 22

  // Extract the date from the suid
  let dateSuid = new Uint8Array([
    0, 0, 141, 33, 250, 205, 174, 58, 31, 221, 187, 156, 31, 221, 187, 156,
  ])
  expect(suidBytesDate(dateSuid)).toEqual(new Date("2020-10-10T22:10:14.349Z"))

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

test("should sort correctly", async () => {
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

test("should evaluate demo", async () => {
  expect.assertions(100)
  for (let i = 0; i < 100; i++) {
    const shortSortableId = suid()
    await sleep(2)
    const nextSUID = suid()
    expect(shortSortableId < nextSUID).toBe(true)
  }
})
