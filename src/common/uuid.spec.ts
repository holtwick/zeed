import { useBaseX } from "./basex"
import { suid, suidBytes, suidBytesDate, suidDate, uname, uuid } from "./uuid"

test("should not have collisions", () => {
  expect(uuid().length).toBe(26)
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
    0, 0, 141, 33, 250, 205, 174, 58, 31, 221, 187, 156,
  ])
  expect(suidBytesDate(dateSuid)).toEqual(new Date("2021-06-28T09:43:34.349Z"))

  //
  const { decode } = useBaseX(62)

  expect(decode("000iLynKhjMjrZAI6yaDmw", 16)).toEqual(new Uint8Array([]))
  expect(suidDate("000iLynKhjMjrZAI6yaDmw")).toEqual(
    new Date("2021-06-28T09:43:34.349Z")
  )
})
