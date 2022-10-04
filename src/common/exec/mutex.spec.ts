// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { useAsyncMutex, useMutex } from './mutex'

describe('mutex', () => {
  it('should mutex', () => {
    let ctr = 0
    const m = useMutex()
    m(() => {
      ++ctr
      m(
        () => {
          ++ctr
          m(
            () => {
              ++ctr
            },
            () => (ctr += 10), // never reached
          )
        },
        () => (ctr += 10),
      )
    })
    expect(ctr).toBe(11)
  })

  it('should async mutex', async () => {
    let ctr = 0
    const m = useAsyncMutex()
    await m(async () => {
      ++ctr
      await m(
        async () => {
          ++ctr
          await m(
            async () => {
              ++ctr
            },
            async () => (ctr += 10), // never reached
          )
        },
        async () => (ctr += 10),
      )
    })
    expect(ctr).toBe(11)
  })
})
