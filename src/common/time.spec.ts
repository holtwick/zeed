import { sleep } from './exec'
import { duration } from './time'

describe('time.spec', () => {
  it('should measure', async () => {
    const getDuration = duration()
    await sleep(50)
    const elapsed = getDuration()
    // console.log(`elapsed time: ${elapsed}`)
    expect(/\d+.\d\d ms/.test(elapsed)).toBe(true)
  })
})
