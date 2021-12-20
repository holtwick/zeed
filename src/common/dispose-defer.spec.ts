// (C)opyright 20210922 Dirk Holtwick, holtwick.it. All rights reserved.

import { useDefer, useDispose } from "./dispose-defer"

describe("dispose", () => {
  it("should dispose correctly", async () => {
    let disposeCalls: any[] = []
    const dispose = useDispose()

    const y = dispose.track({
      dispose() {
        disposeCalls.push(1)
      },
    })
    dispose.track(() => {
      disposeCalls.push(2)
    })

    const x = {
      async dispose() {
        disposeCalls.push(3)
      },
    }
    dispose.track(x)

    dispose.track(async () => {
      disposeCalls.push(4)
    })
    expect(disposeCalls).toEqual([])
    expect(dispose.getSize()).toEqual(4)

    await dispose.untrack(x)
    expect(disposeCalls).toEqual([3])
    expect(dispose.getSize()).toEqual(3)

    await dispose.untrack(x)
    expect(disposeCalls).toEqual([3])
    expect(dispose.getSize()).toEqual(3)

    y()
    y()
    await dispose.untrack(x)
    expect(disposeCalls).toEqual([3, 1])
    expect(dispose.getSize()).toEqual(2)

    await dispose.dispose()
    expect(disposeCalls).toEqual([3, 1, 4, 2])
    expect(dispose.getSize()).toEqual(0)

    await dispose.dispose()
    expect(disposeCalls).toEqual([3, 1, 4, 2])
    expect(dispose.getSize()).toEqual(0)
  })

  it("should be a fancy dispose itself", () => {
    let x = 1
    class Some {
      dispose = useDispose()

      constructor() {
        this.dispose.track(() => {
          x = 2
        })
      }
    }

    let obj = new Some()
    expect(x).toBe(1)

    obj.dispose()
    expect(x).toBe(2)
  })

  it("should defer lifo", async () => {
    let stack: string[] = []
    const defer = useDefer({ mode: "lifo" })
    defer.add(() => stack.push("a"))
    defer.add(() => stack.push("b"))
    defer.add(() => stack.push("c"))
    expect(stack).toEqual([])
    defer(true)
    expect(stack).toEqual(["c", "b", "a"])
  })

  it("should defer lifo", async () => {
    let stack: string[] = []
    const defer = useDefer({ mode: "fifo" })
    defer.add(() => stack.push("a"))
    defer.add(async () => stack.push("b"))
    defer.add(() => stack.push("c"))
    expect(stack).toEqual([])
    await defer()
    expect(stack).toEqual(["a", "b", "c"])
  })
})
