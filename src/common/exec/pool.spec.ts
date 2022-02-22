import { usePool } from "./pool"
import { sleep } from "./promise"

describe("pool", () => {
  it("should execute some", async () => {
    let r: any[] = []
    const pool = usePool({ maxParallel: 2 })

    let collectedEvents: any = []
    pool.events.onAny((...args) => collectedEvents.push(args))

    pool.enqueue(
      async () => {
        r.push("a")
        await sleep(10)
      },
      { id: "a" }
    )
    pool.enqueue(
      async () => {
        r.push("b")
        await sleep(10)
      },
      { id: "b" }
    )
    pool.enqueue(
      async () => {
        r.push("c")
        await sleep(10)
      },
      { id: "c" }
    )
    pool.enqueue(
      async () => {
        r.push("d")
        await sleep(10)
      },
      { id: "d" }
    )
    pool.enqueue(
      async () => {
        r.push("dd")
        await sleep(10)
      },
      { id: "d" }
    )
    pool.enqueue(
      async () => {
        r.push("e")
        await sleep(10)
      },
      { id: "e" }
    )
    let { cancel } = pool.enqueue(
      async () => {
        r.push("f")
        await sleep(10)
      },
      { id: "f" }
    )
    pool.cancel("d")
    cancel()
    expect(r).toMatchInlineSnapshot(`
Array [
  "a",
  "b",
]
`)

    let { promise } = pool.enqueue(
      async () => {
        r.push("g")
        await sleep(10)
        return "g"
      },
      { id: "g" }
    )

    expect(await promise).toBe("g")

    await sleep(100)
    expect(r).toMatchInlineSnapshot(`
Array [
  "a",
  "b",
  "c",
  "e",
  "g",
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
    "didUpdate",
    7,
    2,
  ],
  Array [
    "didResolve",
    "a",
    undefined,
  ],
  Array [
    "didUpdate",
    7,
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
    7,
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
    7,
    5,
  ],
  Array [
    "didStart",
    "g",
  ],
  Array [
    "didResolve",
    "e",
    undefined,
  ],
  Array [
    "didUpdate",
    7,
    6,
  ],
  Array [
    "didResolve",
    "g",
    "g",
  ],
  Array [
    "didUpdate",
    7,
    7,
  ],
  Array [
    "didFinish",
  ],
]
`)
  })
})
