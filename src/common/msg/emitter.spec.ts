// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { platform } from "../platform"
import { waitOn, sleep } from "../exec/promise"
import { Emitter, getGlobalEmitter, lazyListener } from "./emitter"

declare global {
  interface ZeedGlobalEmitter {
    a(n: number): void
    b(n: number): void
  }
}

describe("Emitter", () => {
  it("should emit", async () => {
    expect.assertions(4)

    interface TestMessages {
      test(x: number, y: number): void
      long(): Promise<void>
    }

    let ctr = 0

    let e = new Emitter<TestMessages>()
    e.on("test", (x, y) => expect(x + y).toBe(123))
    e.on("long", async () => {
      await sleep(500)
      ctr++
    })

    let ee = e.call

    await ee.long()
    expect(ctr).toBe(1)

    e.onCall({
      test(x: number, y: number) {
        expect(x + y).toBe(123)
      },
    })

    await e.emit("long")
    expect(ctr).toBe(2)

    await e.emit("test", 100, 23)
  })

  it("should work", async () => {
    interface TestMessages {
      a(): void
      b(): void
    }

    let e1 = new Emitter<TestMessages>()
    let e2 = new Emitter<TestMessages>()

    let counter = 99

    e1.on("a", () => counter++)

    e2.on("a", () => counter--)
    e2.on("b", () => counter--)

    e1.emit("a")

    expect(counter).toBe(100)

    e2.emit("a")
    e2.emit("b")

    expect(counter).toBe(98)

    e1.on("a", () => counter++)
    e1.emit("a") // twice!
    expect(counter).toBe(100)

    e1.removeAllListeners()
    e1.emit("a") // no listeners!
    expect(counter).toBe(100)
  })

  it("should wait on", async () => {
    let e1 = new Emitter()

    setTimeout(() => {
      e1.emit("f", 1)
    }, 100)

    let v = await waitOn(e1, "f")
    expect(v).toBe(1)

    if (platform.jest) {
      await expect(waitOn(e1, "x", 10)).rejects.toThrow(
        "Did not response in time"
      )
      // } else {
      //   // https://jasmine.github.io/api/3.5/global
      //   await expectAsync(on(e1, "x", 10)).toBeRejectedWithError(
      //     "Did not response in time"
      //   )
    }
  })

  it("should work lazy", async () => {
    let e1 = new Emitter()
    let e2 = new Emitter()

    let on1 = lazyListener(e1)
    let on2 = lazyListener(e2)

    await e1.emit("a", 1)
    await e1.emit("b", 2)

    await e2.emit("a", 3)

    expect(await on2("a")).toBe(3)
    // expect(await on1("a")).toBe(1)
    expect(await on1("b")).toBe(2)
  })

  it("should expect events", async () => {
    expect.assertions(3)

    let e = new Emitter()

    e.on("a", (v) => expect(v).toBe(1))
    e.on("a", (v) => expect(v).toBe(1))
    e.on("b", (v) => expect(v).toBe(1))

    await e.emit("a", 1)
    await e.emit("b", 1)
  })

  it("should expect once", async () => {
    expect.assertions(1)

    let e = new Emitter()

    e.once("a", (v) => expect(v).toBe(1))

    e.emit("a", 1)
    e.emit("a", 2)
    e.emit("a", 3)
  })

  it("should mock events", async () => {
    let fn = jest.fn()

    let e = new Emitter()

    e.on("a", fn)
    e.on("a", fn)
    e.on("b", fn)

    await e.emit("a", 1)
    await e.emit("b", 1)

    expect(fn).toBeCalledTimes(3)
  })

  it("should work with global listener", async () => {
    let fn = jest.fn()

    let e = getGlobalEmitter()

    e.on("a", fn)
    e.on("a", fn)
    e.on("b", fn)

    await e.emit("a", 1)
    await getGlobalEmitter().emit("b", 1)

    expect(fn).toBeCalledTimes(3)
  })
})
