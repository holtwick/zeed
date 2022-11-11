// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { sleep } from './promise'
import { debounce, throttle } from './throttle-debounce'

describe('throttle', () => {
  it('should throttle correctly', async () => {
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

  it('should debounce correctly', async () => {
    let ctr = 0
    expect(ctr).toBe(0)
    const fn = debounce(() => ctr++, { delay: 100 })
    expect(ctr).toBe(0)

    fn()
    fn()
    expect(ctr).toBe(0)
    await sleep(50)
    fn()
    expect(ctr).toBe(0)
    await sleep(50)
    fn()
    expect(ctr).toBe(0)
    await sleep(50)
    fn()
    expect(ctr).toBe(0)
    await sleep(110)
    expect(ctr).toBe(1)

    fn()
    await sleep(110)
    expect(ctr).toBe(2)
  })

  it('should throttle with least args', async () => {
    let r = 0
    const fn = throttle(
      (v: number) => {
        r = v
        // log("FN", v)
      },
      { delay: 50 },
    )

    // Exec leading 0ms
    fn(1)
    expect(r).toBe(1)
    fn(2)
    expect(r).toBe(1)
    fn(3)
    fn(4)

    // Now delay is finished and triggers trailing 150ms
    await sleep(200)
    expect(r).toBe(4)
  })

  it('should debounce long running promise', async () => {
    let r = 0
    const fn = debounce(
      async (v: number) => {
        await sleep(200)
        r = v
        // console.log("FN", v)
      },
      { delay: 50 },
    )

    expect(r).toBe(0)
    fn(1)
    expect(r).toBe(0)
    await sleep(50)
    expect(r).toBe(0)
    fn(2)
    await sleep(150)
    fn(3)
    expect(r).toBe(0)
    await sleep(150)
    expect(r).toBe(1)
    await sleep(300)
    expect(r).toBe(3)
  })
})
