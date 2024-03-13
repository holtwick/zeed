import { sleep } from './exec'
import { duration, parseDate } from './time'

describe('time.spec', () => {
  it('should measure', async () => {
    const getDuration = duration()
    await sleep(50)
    const elapsed = getDuration()
    // console.log(`elapsed time: ${elapsed}`)
    expect(/\d+.\d\d ms/.test(elapsed)).toBe(true)
  })

  it('should parse valid date strings', () => {
    const date1 = parseDate('2022-01-01')
    const date2 = parseDate('2022-01-01T12:00:00')
    expect(date1).toEqual(new Date(2022, 0, 1, 12, 0))
    expect(date2).toEqual(new Date('2022-01-01T12:00:00'))
  })

  it('should return undefined for invalid date strings', () => {
    const date = parseDate('invalid-date')
    expect(date).toBeUndefined()
  })

  it('should return the input date if it is already a Date object', () => {
    const inputDate = new Date()
    const date = parseDate(inputDate)
    expect(date).toBe(inputDate)
  })
})
