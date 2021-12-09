import { sleep } from "."
import { usePool } from "./pool"
describe("pool", () => {
  it("should execute some", async () => {
    let r: any[] = []
    const pool = usePool({ maxParallel: 2 })
    pool.enqueue("a", async () => {
      r.push("a")
    })
    pool.enqueue("b", async () => {
      r.push("b")
    })
    pool.enqueue("c", async () => {
      r.push("c")
    })
    pool.enqueue("d", async () => {
      r.push("d")
    })
    pool.enqueue("d", async () => {
      r.push("dd")
    })
    pool.enqueue("e", async () => {
      r.push("e")
    })
    let cancel = pool.enqueue("f", async () => {
      r.push("f")
    })
    pool.cancel("d")
    cancel()
    expect(r).toMatchInlineSnapshot(`
Array [
  "a",
  "b",
]
`)
    await sleep(1)
    expect(r).toMatchInlineSnapshot(`
Array [
  "a",
  "b",
  "c",
  "e",
]
`)
  })
})
