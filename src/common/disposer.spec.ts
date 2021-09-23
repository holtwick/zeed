// (C)opyright 20210922 Dirk Holtwick, holtwick.it. All rights reserved.

import { useDisposer } from "./disposer"

describe("dispose", () => {
  it("should dispose correctly", async () => {
    let disposeCalls: any[] = []
    const disposer = useDisposer()

    const y = disposer.track({
      dispose() {
        disposeCalls.push(1)
      },
    })
    disposer.track(() => disposeCalls.push(2))

    const x = {
      async dispose() {
        disposeCalls.push(3)
      },
    }
    disposer.track(x)

    disposer.track(async () => disposeCalls.push(4))
    expect(disposeCalls).toEqual([])
    expect(disposer.getSize()).toEqual(4)

    await disposer.untrack(x)
    expect(disposeCalls).toEqual([3])
    expect(disposer.getSize()).toEqual(3)

    await disposer.untrack(x)
    expect(disposeCalls).toEqual([3])
    expect(disposer.getSize()).toEqual(3)

    y()
    y()
    await disposer.untrack(x)
    expect(disposeCalls).toEqual([3, 1])
    expect(disposer.getSize()).toEqual(2)

    await disposer.dispose()
    expect(disposeCalls).toEqual([3, 1, 4, 2])
    expect(disposer.getSize()).toEqual(0)

    await disposer.dispose()
    expect(disposeCalls).toEqual([3, 1, 4, 2])
    expect(disposer.getSize()).toEqual(0)
  })

  it("should be a fancy disposer itself", () => {
    let x = 1
    class Some {
      dispose = useDisposer()

      constructor() {
        this.dispose.track(() => (x = 2))
      }
    }

    let obj = new Some()
    expect(x).toBe(1)

    obj.dispose()
    expect(x).toBe(2)
  })
})
