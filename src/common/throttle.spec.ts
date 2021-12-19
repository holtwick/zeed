// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { sleep } from "../common/promise"
import { throttle } from "./throttle"

describe("throttle", () => {
  it("should throttle correctly", async () => {
    // expect.assertions(1)
    let ctr = 0
    expect(ctr).toBe(0)
    const fn = throttle(() => ctr++, { delay: 100 })
    expect(ctr).toBe(0)

    // Exec leading 0ms
    fn()
    expect(ctr).toBe(1)
    fn()
    fn()
    expect(ctr).toBe(1)
    await sleep(50)
    expect(ctr).toBe(1)

    // Now delay is finished and triggers trailing 150ms
    await sleep(100)
    expect(ctr).toBe(2)

    // Not yet elapsed enough time 150ms
    fn()
    expect(ctr).toBe(2)

    // Now time window has been reached 250ms
    await sleep(100)
    expect(ctr).toBe(3)

    // Cancel
    fn()
    fn.cancel()
    await sleep(100)
    expect(ctr).toBe(3)
  })
})
