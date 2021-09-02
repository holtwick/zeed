// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from "../log"
import { LocalChannel } from "./channel"

const log = Logger("test:channel")

// class FakeSimpleChannel implements SimpleChannel {
//   _other?: FakeSimpleChannel
//   _fn?: (data: any) => void

//   _onmessage(data: any) {
//     this._fn?.(data)
//   }

//   subscribeData(fn: (data: any) => void) {
//     this._fn = fn
//   }

//   publishData(data: any) {
//     setTimeout(() => {
//       this._other?._onmessage(data)
//     }, 0)
//   }

//   async cleanup() {}
// }

function fakeWorkerPair(): [LocalChannel, LocalChannel] {
  let w1 = new LocalChannel()
  let w2 = new LocalChannel()

  w1.other = w2
  w2.other = w1

  return [w1, w2]
}

describe("Channel", () => {
  it("should fake", (done) => {
    // log.info("done", done.toSource())
    expect.assertions(1)

    let [f1, f2] = fakeWorkerPair()

    f1.on("message", (ev) => {
      expect(ev.data).toBe("123")
      done()
    })

    f2.postMessage("123")
  })

  // it("should connect", async (done) => {
  //   let c1 = new Channel()
  //   expect(c1).toBeTruthy()

  //   let c2 = new Channel()
  //   expect(c2).toBeTruthy()

  //   c1.connect(c2)

  //   c2.subscribe((obj) => {
  //     expect(obj).toEqual({ a: 1 })
  //     done()
  //   })

  //   c1.send({ a: 1 })
  // })

  // it("should support fake worker", async (done) => {
  //   let [w1, w2] = fakeWorkerPair()

  //   let c1 = new PostChannel(w1)
  //   let c2 = new PostChannel(w2)

  //   c2.subscribe((obj) => {
  //     expect(obj).toEqual({ a: 1 })
  //     done()
  //   })

  //   c1.publish({ a: 1 })
  // })

  // it("should support fake task worker", async (done) => {
  //   let [w1, w2] = fakeWorkerPair()

  //   let c1 = new PostChannel(w1)
  //   let c2 = new PostChannel(w2)

  //   let q1 = new ChannelTaskQueue(c1)
  //   let q2 = new ChannelTaskQueue(c2)

  //   q2.on("question", (obj) => {
  //     setTimeout(() => {
  //       q2.emit("answer", obj + " from Remote")
  //     }, 1)
  //   })

  //   q1.on("answer", (obj) => {
  //     expect(obj).toBe("Hello from Remote")
  //     done()
  //   })

  //   q1.emit("question", "Hello")
  // })

  // it("should perform handshake", (done) => {
  //   let [w1, w2] = fakeWorkerPair()

  //   let c1 = new PostChannel()
  //   let c2 = new PostChannel()

  //   let r = {}

  //   let q1 = new ChannelTaskQueue(c1)
  //   q1.on("cmd", (obj) => {
  //     log("r.q1")
  //     r.q1 = true
  //   })
  //   q1.emit("cmd")

  //   let q2 = new ChannelTaskQueue(c2)
  //   q2.on("cmd", (obj) => {
  //     log("r.q2")
  //     r.q2 = true
  //   })
  //   q2.emit("cmd")

  //   setTimeout(() => {
  //     c2.connect(w2)
  //     setTimeout(() => {
  //       c1.connect(w1)
  //       setTimeout(() => {
  //         expect(r).toEqual({ q1: true, q2: true })
  //         done()
  //       }, 100)
  //     }, 50)
  //   }, 50)
  // })
})
