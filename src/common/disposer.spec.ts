// (C)opyright 20210922 Dirk Holtwick, holtwick.it. All rights reserved.

import { useDisposer } from "./disposer"

describe("dispose", () => {
  it("should dispose correctly", async () => {
    let disposeCalls: any[] = []
    const disposer = useDisposer()
    disposer.track({
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
    expect(disposer.size).toEqual(4)

    await disposer.untrack(x)
    expect(disposeCalls).toEqual([3])
    expect(disposer.size).toEqual(3)

    await disposer.untrack(x)
    expect(disposeCalls).toEqual([3])
    expect(disposer.size).toEqual(3)

    await disposer.dispose()
    expect(disposeCalls).toEqual([3, 4, 2, 1])
    expect(disposer.size).toEqual(0)

    await disposer.dispose()
    expect(disposeCalls).toEqual([3, 4, 2, 1])
    expect(disposer.size).toEqual(0)
  })
})
