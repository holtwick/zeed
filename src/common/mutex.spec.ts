import { createMutex } from "./mutex"

describe("Mutex", () => {
  it("should lock", () => {
    let ctr = 0
    let m = createMutex()
    m(() => {
      ++ctr
      m(() => {
        ++ctr
        m(() => {
          ++ctr
        })
      })
    })
    expect(ctr).toBe(1)
  })
})
