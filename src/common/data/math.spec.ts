import { webcrypto } from "crypto"
import { getSecureRandom, randomBoolean } from "./math"

if (globalThis.crypto == null) {
  // @ts-ignore
  globalThis.crypto = webcrypto
}

describe("math", () => {
  it("should not have collisions", () => {
    let list: number[] = Array.apply(null, Array(1000)).map(() =>
      getSecureRandom()
    )
    let id: number | undefined
    while ((id = list.pop())) {
      expect(id >= 0).toBe(true)
      expect(id < 1).toBe(true)
      expect(list).not.toContain(id)
    }
  })

  it("should bias", () => {
    let sum = 0
    for (let i = 0; i < 1000; i++) {
      sum += randomBoolean(0.1) ? 1 : 0
    }
    expect(sum / 1000).toBeLessThan(0.2)
  })
})
