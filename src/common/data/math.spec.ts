import { webcrypto } from "crypto"
import { getSecureRandom } from "./math"

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
})
