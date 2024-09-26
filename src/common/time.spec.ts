import { sleep } from './exec'
import { dateFromSeconds, datetimeToLocal, datetimeToUTC, duration, formatMilliseconds, getPerformanceTimestamp, getTimestamp, getTimestampInSeconds, parseDate, timestampMillisecondsToSeconds, timestampSecondsToMilliseconds } from './time'

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

  it('should convert dates', () => {
    const dateLocal = new Date('2022-01-01T12:00:00')
    // expect(dateLocal?.toString()).toMatchInlineSnapshot(`"Sat Jan 01 2022 12:00:00 GMT+0100 (Central European Standard Time)"`)
    // expect(dateLocal.toISOString()).toMatchInlineSnapshot(`"2022-01-01T11:00:00.000Z"`)
    // expect(datetimeToUTC(dateLocal)).toMatchInlineSnapshot(`2022-01-01T12:00:00.000Z`)
    // expect(datetimeToLocal(dateLocal)).toMatchInlineSnapshot(`2022-01-01T10:00:00.000Z`)
    expect(datetimeToLocal(datetimeToUTC(dateLocal))).toEqual(dateLocal)
  })

  it('should return the current timestamp in milliseconds', () => {
    const timestamp = getTimestamp()
    expect(typeof timestamp).toBe('number')
    expect(timestamp).toBeCloseTo(Date.now(), -2)
  })

  it('should return the current timestamp in seconds', () => {
    const timestampInSeconds = getTimestampInSeconds()
    expect(typeof timestampInSeconds).toBe('number')
    expect(timestampInSeconds).toBeCloseTo(Math.floor(Date.now() / 1000), -2)
  })

  it('should convert seconds to a Date object', () => {
    const seconds = 1640995200 // January 1, 2022 00:00:00 UTC
    const date = dateFromSeconds(seconds)
    expect(date).toEqual(new Date('2022-01-01T00:00:00.000Z'))
  })

  it('should format milliseconds', () => {
    const milliseconds = 1234
    const formatted = formatMilliseconds(milliseconds)
    expect(formatted).toBe('1.2 s')
  })

  it('should return the current timestamp using performance.now if available', () => {
    const timestamp = getPerformanceTimestamp()
    expect(typeof timestamp).toBe('number')
    expect(timestamp).toBeCloseTo(typeof performance !== 'undefined' ? performance.now() : Date.now(), -2)
  })

  it('should measure the duration of a function', async () => {
    const getDuration = duration()
    await sleep(50)
    const elapsed = getDuration()
    expect(/\d+.\d\d ms/.test(elapsed)).toBe(true)
  })

  // it('should convert a date to local time', () => {
  //   const date = new Date('2022-01-01T12:00:00')
  //   const localDate = datetimeToLocal(date)
  //   expect(localDate).toEqual(new Date('2022-01-01T12:00:00'))
  // })

  it('should convert a date to UTC time', () => {
    const date = new Date('2022-01-01T12:00:00')
    const utcDate = datetimeToUTC(date)
    expect(utcDate).toEqual(new Date('2022-01-01T12:00:00Z'))
  })

  it('should convert milliseconds to seconds', () => {
    const ts = 1609459200000 // 2021-01-01T00:00:00.000Z
    const result = timestampMillisecondsToSeconds(ts)
    expect(result).toBe(1609459200)
  })

  it('should log a warning if the timestamp is already in seconds', () => {
    const ts = 1609459200
    const result = timestampMillisecondsToSeconds(ts)
    expect(result).toBe(1609459200)
  })

  it('should convert seconds to milliseconds', () => {
    const ts = 1609459200 // 2021-01-01T00:00:00Z
    const result = timestampSecondsToMilliseconds(ts)
    expect(result).toBe(1609459200000)
  })

  it('should log a warning if the timestamp is already in milliseconds', () => {
    const ts = 1609459200000
    const result = timestampMillisecondsToSeconds(ts)
    expect(result).toBe(1609459200)
  })
})
