import { isPromise, promisify, sleep, timeout, timeoutReached } from "./promise"

describe("Promises", () => {
  async function demo() {
    return 999
  }

  function demoSync() {
    return 888
  }

  it("should identify promise", async () => {
    expect(isPromise(null)).toBe(false)
    expect(isPromise(new Promise((r) => 1))).toBe(true)
    expect(isPromise(demo)).toBe(false)
    expect(isPromise(demo())).toBe(true)
    expect(isPromise(await demo())).toBe(false)
  })

  it("should await", async () => {
    expect(await promisify(demo())).toBe(999)
    expect(await promisify(await demo())).toBe(999)
    expect(await promisify(demoSync())).toBe(888)
  })

  it("should timeout", async () => {
    let r = await timeout(sleep(1000), 500)
    expect(r).toBe(timeoutReached)
    let r2 = await timeout(
      (async () => {
        return 123
      })(),
      500
    )
    expect(r2).toBe(123)
  })
})
