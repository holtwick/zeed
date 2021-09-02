// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { immediate, Logger } from ".."
import { LogLevel } from "../log"
import { TaskQueue } from "./mq"

// require('debug').enable('*')
const log = Logger("debug:mq")
log.level = LogLevel.off

describe("MQ", () => {
  it("should perform each entry", async () => {
    let q = new TaskQueue()
    let r: any[] = []
    q.on("progress", (msg) => {
      r.push(msg)
    })
    for (let i = 1; i <= 10; i++) {
      q.emit("progress", i)
    }
    log("will wait")
    await q.wait()
    log("did wait")
    expect(r).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    log("done")
  })

  it("should perform only the last one", async () => {
    let q = new TaskQueue()
    let r: any[] = []
    q.on(
      "progress",
      (msg) => {
        r.push(msg)
      },
      {
        latest: true,
      }
    )
    for (let i = 1; i <= 10; i++) {
      q.emit("progress", i)
    }
    await q.wait()
    expect(r).toEqual([10])
  })

  it("should persist", async () => {
    let q = new TaskQueue()
    let r: any[] = []
    q.on(
      "progress",
      (msg) => {
        r.push(msg)
      },
      {
        batch: 3,
        // persist: true
      }
    )
    for (let i = 1; i <= 10; i++) {
      q.emit("progress", i)
    }
    log("n0 %j", r)
    expect(r).toEqual([])
    await immediate()
    log("n1 %j", r)
    expect(r).toEqual([1, 2, 3])
    // q.pause()
    await q.wait()
    log("n2 %j", r)
    expect(r).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it("should fetch", async () => {
    let q = new TaskQueue()
    q.on("progress", (msg) => {
      return msg + " ok"
    })
    let r = await q.fetch("progress", "aaa")
    expect(r).toEqual("aaa ok")
  })
})
