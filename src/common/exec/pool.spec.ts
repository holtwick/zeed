import { usePool } from './pool'
import { sleep } from './promise'

describe('pool', () => {
  it('should execute some', async () => {
    const r: any[] = []
    const pool = usePool({ maxParallel: 2 })

    const collectedEvents: any = []
    pool.events.onAny((...args) => collectedEvents.push(args))

    expect(pool.progress.getFraction()).toBe(0)
    expect(pool.progress.getTotalUnits()).toBe(0)

    pool.enqueue(
      async () => {
        r.push('a')
        await sleep(10)
      },
      { id: 'a' },
    )

    expect(pool.progress.getTotalUnits()).toBe(1)

    pool.enqueue(
      async (taskInfo) => {
        // info.setProgress(0, 5)
        r.push('b')
        taskInfo?.setResolved(2)
        await sleep(1)
        taskInfo?.incResolved()
        await sleep(1)
        taskInfo?.incResolved()
        await sleep(10)
      },
      { id: 'b', max: 5 },
    )
    pool.enqueue(
      async () => {
        r.push('c')
        await sleep(10)
      },
      { id: 'c' },
    )
    pool.enqueue(
      async () => {
        r.push('d')
        await sleep(10)
      },
      { id: 'd' },
    )
    pool.enqueue(
      async () => {
        r.push('dd')
        await sleep(10)
      },
      { id: 'dd' },
    )
    pool.enqueue(
      async () => {
        r.push('e')
        await sleep(10)
      },
      { id: 'e' },
    )
    const { cancel } = pool.enqueue(
      async () => {
        r.push('f')
        await sleep(10)
      },
      { id: 'f' },
    )

    pool.cancel('dd')
    cancel()
    expect(r).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
      ]
    `)

    const { promise } = pool.enqueue(
      async () => {
        r.push('g')
        await sleep(10)
        return 'g'
      },
      { id: 'g' },
    )

    expect(pool.progress.getTotalUnits()).toBe(10)
    expect(pool.progress.toString()).toMatchInlineSnapshot(`
      "pool-0: 0 of 0 units, 20 %, cancel=false
        a: 0 of 1 units, 0 %, cancel=false
        b: 2 of 5 units, 40 %, cancel=false
        c: 0 of 1 units, 0 %, cancel=false
        d: 0 of 1 units, 0 %, cancel=false
        e: 0 of 1 units, 0 %, cancel=false
        g: 0 of 1 units, 0 %, cancel=false"
    `)

    expect(await promise).toBe('g')

    await pool.waitFinishAll()
    await sleep(1)

    expect(pool.progress.getTotalUnits()).toBe(0)
    expect(pool.progress.getCompletedUnits()).toBe(0)
    expect(pool.progress.getFraction()).toBe(0)
    expect(pool.progress.toString()).toMatchInlineSnapshot('"pool-0: 0 of 0 units, 0 %, cancel=false"')

    expect(r).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
        "c",
        "d",
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
          6,
          0,
        ],
        Array [
          "didStart",
          "b",
        ],
        Array [
          "didUpdate",
          2,
          0,
          6,
          2,
        ],
        Array [
          "didUpdate",
          3,
          0,
          7,
          2,
        ],
        Array [
          "didUpdate",
          4,
          0,
          8,
          2,
        ],
        Array [
          "didUpdate",
          5,
          0,
          9,
          2,
        ],
        Array [
          "didUpdate",
          6,
          0,
          10,
          2,
        ],
        Array [
          "didUpdate",
          7,
          0,
          11,
          2,
        ],
        Array [
          "didCancel",
          "dd",
        ],
        Array [
          "didUpdate",
          7,
          1,
          11,
          3,
        ],
        Array [
          "didCancel",
          "f",
        ],
        Array [
          "didUpdate",
          7,
          2,
          11,
          4,
        ],
        Array [
          "didUpdate",
          8,
          2,
          12,
          4,
        ],
        Array [
          "didUpdate",
          8,
          2,
          12,
          5,
        ],
        Array [
          "didUpdate",
          8,
          2,
          12,
          6,
        ],
        Array [
          "didResolve",
          "a",
          undefined,
        ],
        Array [
          "didUpdate",
          8,
          3,
          12,
          7,
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
          8,
          4,
          12,
          8,
        ],
        Array [
          "didStart",
          "d",
        ],
        Array [
          "didResolve",
          "c",
          undefined,
        ],
        Array [
          "didUpdate",
          8,
          5,
          12,
          9,
        ],
        Array [
          "didStart",
          "e",
        ],
        Array [
          "didResolve",
          "d",
          undefined,
        ],
        Array [
          "didUpdate",
          8,
          6,
          12,
          10,
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
          8,
          7,
          12,
          11,
        ],
        Array [
          "didResolve",
          "g",
          "g",
        ],
        Array [
          "didUpdate",
          8,
          8,
          12,
          12,
        ],
        Array [
          "didFinish",
        ],
      ]
    `)
  })

  it('should respect group', async () => {
    const r: any[] = []
    const pool = usePool({ maxParallel: 3 })

    const collectedEvents: any = []
    pool.events.onAny((...args) => collectedEvents.push(args))

    pool.enqueue(
      async () => {
        r.push('ga')
        await sleep(10)
      },
      { id: 'ga', group: 'x' },
    )
    pool.enqueue(
      async () => {
        r.push('gb')
        await sleep(10)
      },
      { id: 'gb', group: 'x' },
    )
    pool.enqueue(
      async () => {
        r.push('gc')
        await sleep(10)
      },
      { id: 'gc', group: 'x' },
    )
    pool.enqueue(
      async () => {
        r.push('1')
        await sleep(10)
      },
      { id: '1' },
    )
    pool.enqueue(
      async () => {
        r.push('2')
        await sleep(10)
      },
      { id: '2' },
    )

    expect(r).toMatchInlineSnapshot(`
      Array [
        "ga",
        "1",
        "2",
      ]
    `)

    await pool.waitFinishAll()

    expect(r).toMatchInlineSnapshot(`
      Array [
        "ga",
        "1",
        "2",
        "gb",
        "gc",
      ]
    `)

    expect(collectedEvents).toMatchInlineSnapshot(`
      Array [
        Array [
          "didUpdate",
          1,
          0,
          1,
          0,
        ],
        Array [
          "didStart",
          "ga",
        ],
        Array [
          "didUpdate",
          2,
          0,
          2,
          0,
        ],
        Array [
          "didUpdate",
          3,
          0,
          3,
          0,
        ],
        Array [
          "didUpdate",
          4,
          0,
          4,
          0,
        ],
        Array [
          "didStart",
          "1",
        ],
        Array [
          "didUpdate",
          5,
          0,
          5,
          0,
        ],
        Array [
          "didStart",
          "2",
        ],
        Array [
          "didResolve",
          "ga",
          undefined,
        ],
        Array [
          "didUpdate",
          5,
          1,
          5,
          1,
        ],
        Array [
          "didStart",
          "gb",
        ],
        Array [
          "didResolve",
          "1",
          undefined,
        ],
        Array [
          "didUpdate",
          5,
          2,
          5,
          2,
        ],
        Array [
          "didResolve",
          "2",
          undefined,
        ],
        Array [
          "didUpdate",
          5,
          3,
          5,
          3,
        ],
        Array [
          "didResolve",
          "gb",
          undefined,
        ],
        Array [
          "didUpdate",
          5,
          4,
          5,
          4,
        ],
        Array [
          "didStart",
          "gc",
        ],
        Array [
          "didResolve",
          "gc",
          undefined,
        ],
        Array [
          "didUpdate",
          5,
          5,
          5,
          5,
        ],
        Array [
          "didFinish",
        ],
      ]
    `)
  })
})
