import { Logger } from "../common"
import { sleep } from "../common/promise"
import { LogLevel } from "./log"
import { SerialQueue } from "./queue"

const log = Logger("queue")

const debug = false // LogLevel.info

describe("queue", () => {
  it("should execute in strict order", async () => {
    expect.assertions(1)

    let list: any = []
    let queue = new SerialQueue({ debug })
    queue.enqueue(async () => {
      await sleep(100)
      list.push("a")
    })
    queue.enqueue(async () => {
      await sleep(200)
      list.push("b")
    })
    queue.enqueue(async () => {
      await sleep(1)
      list.push("c")
    })
    await queue.wait()
    expect(list).toEqual(["a", "b", "c"])
  })

  it("should execute in random order", async () => {
    expect.assertions(1)

    let list: any = []

    ;(async () => {
      await sleep(100)
      list.push("a")
    })()
    ;(async () => {
      await sleep(200)
      list.push("b")
    })()
    ;(async () => {
      await sleep(1)
      list.push("c")
    })()

    await sleep(500)

    expect(list).toEqual(["c", "a", "b"])
  })

  it("should return value", async () => {
    expect.assertions(2)

    let list: any = []
    let queue = new SerialQueue({ debug })
    queue.enqueue(async () => {
      await sleep(100)
      list.push("a")
    })
    let r = await queue.enqueue(async () => {
      await sleep(200)
      list.push("b")
      return 123
    })

    expect(r).toEqual(123)
    expect(list).toEqual(["a", "b"])

    await queue.wait()
  })

  it("should pause", async () => {
    expect.assertions(2)

    let list: any = []
    let queue = new SerialQueue({ debug })
    queue.enqueue(async () => {
      await sleep(100)
      list.push("a")
    })
    queue.enqueue(async () => {
      await sleep(200)
      list.push("b")
    })
    queue.enqueue(async () => {
      await sleep(1)
      list.push("c")
    })
    await queue.pause()
    expect(list).toEqual(["a"])

    queue.resume()
    await queue.wait()
    expect(list).toEqual(["a", "b", "c"])
  })

  it("should cancel the rest", async () => {
    expect.assertions(2)

    let list: any = []
    let queue = new SerialQueue({ debug })

    await queue.pause()

    queue.enqueue(async () => {
      await sleep(100)
      list.push("a")
    })
    queue.enqueue(async () => {
      await sleep(200)
      list.push("b")
    })
    queue
      .enqueue(async () => {
        await sleep(1)
        list.push("c")
      })
      .then((r) => {
        expect(r).toBe(undefined)
      })

    await queue.cancelAll()
    queue.resume()

    await queue.wait()
    expect(list).toEqual([])
  })
})
