import { useBaseX } from "./basex"
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
  expect(sample).toHaveLength("000iLynKhjMjrZAI6yaDmw".length) // === 22

  // Extract the date from the suid
  let dateSuid = new Uint8Array([
    0, 0, 141, 33, 250, 205, 174, 58, 31, 221, 187, 156, 31, 221, 187, 156,
  ])
  expect(suidBytesDate(dateSuid)).toEqual(new Date("2020-10-10T22:10:14.349Z"))

  //
  const { encode, decode } = useBaseX(62)

  expect(encode(dateSuid, 22)).toBe("000fCttjIoTJZRdgjvHFOA")
  expect(decode("000fCttjIoTJZRdgjvHFOA", 16)).toEqual(dateSuid)

  expect(decode("000iLynKhjMjrZAI6yaDmw", 16)).toEqual(
    new Uint8Array([
      0, 0, 169, 143, 156, 155, 147, 176, 209, 12, 190, 214, 236, 69, 50, 32,
    ])
  )

  expect(suidDate("000iLynKhjMjrZAI6yaDmw")).toEqual(
    new Date("2020-10-16T10:39:21.243Z")
  )
})

test("should evaluate demo", async () => {
  const shortSortableId = suid()
  console.log(shortSortableId)

  console.log(suidDate(shortSortableId))
  await sleep(1)
  expect(shortSortableId < suid()).toBe(true)
})
