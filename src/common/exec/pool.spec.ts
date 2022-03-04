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
      async (taskInfo) => {
        //info.setProgress(0, 5)
        r.push("b")
        taskInfo.setResolved(2)
        await sleep(1)
        taskInfo.incResolved()
        await sleep(1)
        taskInfo.incResolved()
        await sleep(10)
      },
      { id: "b", max: 5 }
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
      { id: "dd" }
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
    pool.cancel("dd")
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

    await pool.waitFinishAll()

    expect(r).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "c",
        "d",
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
          6,
          0,
        ],
        [
          "didStart",
          "b",
        ],
        [
          "didUpdate",
          2,
          0,
          6,
          2,
        ],
        [
          "didUpdate",
          3,
          0,
          7,
          2,
        ],
        [
          "didUpdate",
          4,
          0,
          8,
          2,
        ],
        [
          "didUpdate",
          5,
          0,
          9,
          2,
        ],
        [
          "didUpdate",
          6,
          0,
          10,
          2,
        ],
        [
          "didUpdate",
          7,
          0,
          11,
          2,
        ],
        [
          "didCancel",
          "dd",
        ],
        [
          "didUpdate",
          7,
          1,
          11,
          3,
        ],
        [
          "didCancel",
          "f",
        ],
        [
          "didUpdate",
          7,
          2,
          11,
          4,
        ],
        [
          "didUpdate",
          8,
          2,
          12,
          4,
        ],
        [
          "didUpdate",
          8,
          2,
          12,
          5,
        ],
        [
          "didUpdate",
          8,
          2,
          12,
          6,
        ],
        [
          "didResolve",
          "a",
          undefined,
        ],
        [
          "didUpdate",
          8,
          3,
          12,
          7,
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
          8,
          4,
          12,
          8,
        ],
        [
          "didStart",
          "d",
        ],
        [
          "didResolve",
          "c",
          undefined,
        ],
        [
          "didUpdate",
          8,
          5,
          12,
          9,
        ],
        [
          "didStart",
          "e",
        ],
        [
          "didResolve",
          "d",
          undefined,
        ],
        [
          "didUpdate",
          8,
          6,
          12,
          10,
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
          8,
          7,
          12,
          11,
        ],
        [
          "didResolve",
          "g",
          "g",
        ],
        [
          "didUpdate",
          8,
          8,
          12,
          12,
        ],
        [
          "didFinish",
        ],
      ]
    `)
  })
})
