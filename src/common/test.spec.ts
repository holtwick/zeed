import { dayFromToday } from './data'
import { setTestMode } from './test'
import { getTimestamp, getTimestampInSeconds } from './time'
import { uuid } from './uuid'

describe('test.spec', () => {
  it('should test', async () => {
    setTestMode()

    // UUID should start with 'test-' and increment
    expect(uuid()).toMatch('test-0')
    expect(uuid()).toMatch('test-1')

    // Timestamp should be set to a fixed value
    expect(getTimestamp()).toBe(Date.UTC(2000, 0, 1, 0, 0, 0, 0))
    expect(getTimestampInSeconds()).toBe(Math.floor(Date.UTC(2000, 0, 1, 0, 0, 0, 0) / 1000))

    // Day from today should return a fixed value
    expect(dayFromToday()).toEqual(20000101)
  })
})
