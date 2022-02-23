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
      [
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
      [
        "a",
        "b",
        "c",
        "e",
        "g",
      ]
    `)

    expect(collectedEvents).toMatchInlineSnapshot(`
      [
        [
          "didUpdate",
          1,
          0,
        ],
        [
          "didStart",
          "a",
        ],
        [
          "didUpdate",
          2,
          0,
        ],
        [
          "didStart",
          "b",
        ],
        [
          "didUpdate",
          3,
          0,
        ],
        [
          "didUpdate",
          4,
          0,
        ],
        [
          "didUpdate",
          5,
          0,
        ],
        [
          "didUpdate",
          6,
          0,
        ],
        [
          "didCancel",
          "d",
        ],
        [
          "didUpdate",
          6,
          1,
        ],
        [
          "didCancel",
          "f",
        ],
        [
          "didUpdate",
          6,
          2,
        ],
        [
          "didUpdate",
          7,
          2,
        ],
        [
          "didResolve",
          "a",
          undefined,
        ],
        [
          "didUpdate",
          7,
          3,
        ],
        [
          "didStart",
          "c",
        ],
        [
          "didResolve",
          "b",
          undefined,
        ],
        [
          "didUpdate",
          7,
          4,
        ],
        [
          "didStart",
          "e",
        ],
        [
          "didResolve",
          "c",
          undefined,
        ],
        [
          "didUpdate",
          7,
          5,
        ],
        [
          "didStart",
          "g",
        ],
        [
          "didResolve",
          "e",
          undefined,
        ],
        [
          "didUpdate",
          7,
          6,
        ],
        [
          "didResolve",
          "g",
          "g",
        ],
        [
          "didUpdate",
          7,
          7,
        ],
        [
          "didFinish",
        ],
      ]
    `)
  })
})
