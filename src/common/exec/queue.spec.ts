// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { LogLevel } from '../log-base'
import { sleep } from './promise'
import { SerialQueue } from './queue'

const logLevel = LogLevel.off

describe('queue', () => {
  it('should execute in strict order', async () => {
    expect.assertions(1)

    const list: any = []
    const queue = new SerialQueue({ logLevel })
    queue.enqueue(async () => {
      await sleep(100)
      list.push('a')
    })
    queue.enqueue(async () => {
      await sleep(200)
      list.push('b')
    })
    queue.enqueue(async () => {
      await sleep(1)
      list.push('c')
    })
    await queue.wait()
    expect(list).toEqual(['a', 'b', 'c'])
  })

  it('should execute in random order', async () => {
    expect.assertions(1)

    const list: any = []

    ;(async () => {
      await sleep(100)
      list.push('a')
    })()
    ;(async () => {
      await sleep(200)
      list.push('b')
    })()
    ;(async () => {
      await sleep(1)
      list.push('c')
    })()

    await sleep(500)

    expect(list).toEqual(['c', 'a', 'b'])
  })

  it('should return value', async () => {
    expect.assertions(2)

    const list: any = []
    const queue = new SerialQueue({ logLevel })
    queue.enqueue(async () => {
      await sleep(100)
      list.push('a')
    })
    const r = await queue.enqueue(async () => {
      await sleep(200)
      list.push('b')
      return 123
    })

    expect(r).toEqual(123)
    expect(list).toEqual(['a', 'b'])

    await queue.wait()
  })

  it('should pause', async () => {
    expect.assertions(3)

    const list: any = []
    const queue = new SerialQueue({ logLevel })

    const events: any = []
    queue.onAny((...args) => events.push(args))

    queue.enqueue(async () => {
      await sleep(100)
      list.push('a')
    })
    queue.enqueue(async () => {
      await sleep(200)
      list.push('b')
    })
    queue.enqueue(async () => {
      await sleep(1)
      list.push('c')
    })
    await queue.pause()
    expect(list).toEqual(['a'])

    queue.resume()
    await queue.wait()
    expect(list).toEqual(['a', 'b', 'c'])

    expect(events).toMatchInlineSnapshot(`
      Array [
        Array [
          "didUpdate",
          1,
          0,
        ],
        Array [
          "didStart",
          1,
        ],
        Array [
          "didUpdate",
          2,
          0,
        ],
        Array [
          "didUpdate",
          3,
          0,
        ],
        Array [
          "didUpdate",
          3,
          1,
        ],
        Array [
          "didUpdate",
          3,
          2,
        ],
        Array [
          "didUpdate",
          3,
          3,
        ],
        Array [
          "didFinish",
        ],
      ]
    `)
  })

  it('should cancel the rest', async () => {
    expect.assertions(3)

    const list: any = []
    const queue = new SerialQueue({ logLevel })

    const events: any = []
    queue.onAny((...args) => events.push(args))

    await queue.pause()

    queue.enqueue(async () => {
      await sleep(100)
      list.push('a')
    })
    queue.enqueue(async () => {
      await sleep(200)
      list.push('b')
    })
    queue
      .enqueue(async () => {
        await sleep(1)
        list.push('c')
      })
      .then((r) => {
        expect(r).toBe(undefined)
      })

    await queue.cancelAll()
    queue.resume()

    await queue.wait()
    expect(list).toEqual([])

    expect(events).toMatchInlineSnapshot(`
      Array [
        Array [
          "didUpdate",
          1,
          0,
        ],
        Array [
          "didUpdate",
          2,
          0,
        ],
        Array [
          "didUpdate",
          3,
          0,
        ],
        Array [
          "didCancel",
        ],
        Array [
          "didFinish",
        ],
      ]
    `)
  })
})
