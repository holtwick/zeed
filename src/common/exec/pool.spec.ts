import { usePool } from "./pool"
import { sleep } from "./promise"

describe("pool", () => {
  it("should execute some", async () => {
    let r: any[] = []
    const pool = usePool({ maxParallel: 2 })

    let collectedEvents: any = []
    pool.events.onAny((...args) => collectedEvents.push(args))

    pool.enqueue("a", async () => {
      r.push("a")
      await sleep(10)
    })
    pool.enqueue("b", async () => {
      r.push("b")
      await sleep(10)
    })
    pool.enqueue("c", async () => {
      r.push("c")
      await sleep(10)
    })
    pool.enqueue("d", async () => {
      r.push("d")
      await sleep(10)
    })
    pool.enqueue("d", async () => {
      r.push("dd")
      await sleep(10)
    })
    pool.enqueue("e", async () => {
      r.push("e")
      await sleep(10)
    })
    let cancel = pool.enqueue("f", async () => {
      r.push("f")
      await sleep(10)
    })
    pool.cancel("d")
    cancel()
    expect(r).toMatchInlineSnapshot(`
Array [
  "a",
  "b",
]
`)
    await sleep(100)
    expect(r).toMatchInlineSnapshot(`
Array [
  "a",
  "b",
  "c",
  "e",
]
`)

    expect(collectedEvents).toMatchInlineSnapshot(`
Array [
  Array [
    "didUpdate",
    1,
    0,
  ],
  Array [
    "didStart",
    "a",
  ],
  Array [
    "didUpdate",
    2,
    0,
  ],
  Array [
    "didStart",
    "b",
  ],
  Array [
    "didUpdate",
    3,
    0,
  ],
  Array [
    "didUpdate",
    4,
    0,
  ],
  Array [
    "didUpdate",
    5,
    0,
  ],
  Array [
    "didUpdate",
    6,
    0,
  ],
  Array [
    "didCancel",
    "d",
  ],
  Array [
    "didUpdate",
    6,
    1,
  ],
  Array [
    "didCancel",
    "f",
  ],
  Array [
    "didUpdate",
    6,
    2,
  ],
  Array [
    "didResolve",
    "a",
    undefined,
  ],
  Array [
    "didUpdate",
    6,
    3,
  ],
  Array [
    "didStart",
    "c",
  ],
  Array [
    "didResolve",
    "b",
    undefined,
  ],
  Array [
    "didUpdate",
    6,
    4,
  ],
  Array [
    "didStart",
    "e",
  ],
  Array [
    "didResolve",
    "c",
    undefined,
  ],
  Array [
    "didUpdate",
    6,
    5,
  ],
  Array [
    "didResolve",
    "e",
    undefined,
  ],
  Array [
    "didUpdate",
    6,
    6,
  ],
  Array [
    "didFinish",
  ],
]
`)
  })
})
