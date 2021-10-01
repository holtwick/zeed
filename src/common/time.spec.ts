import {
  daysFromLocalDate,
  DAY_MS,
  getDayOffset,
  getDayOffsetISO,
  getDayOffsetYYYYDDMM,
  toDate,
} from "./time"

describe("Days", () => {
  it("should calc correctly", () => {
    let yesterday = getDayOffset(-1)
    let today = getDayOffset()
    expect(yesterday).toBeLessThan(today)
  })

  it("should respect timezone", () => {
    let ts = new Date("2020-01-01T00:00:00Z").getTime()
    expect(getDayOffset(0, new Date("2020-01-01T00:00:00Z"))).toEqual(ts)
    expect(getDayOffset(0, new Date("2020-01-01T02:00:00Z"))).toEqual(ts)
    expect(getDayOffset(0, new Date("2019-12-31T23:59:59Z"))).toEqual(
      ts - DAY_MS
    )
    expect(getDayOffset(-1, new Date("2020-01-01T00:00:00Z"))).toEqual(
      ts - DAY_MS
    )
    expect(getDayOffsetYYYYDDMM(0, new Date("2020-01-01T00:00:00Z"))).toEqual(
      "20200101"
    )
    expect(getDayOffsetYYYYDDMM(-1, new Date("2020-01-01T00:00:00Z"))).toEqual(
      "20191231"
    )
    expect(getDayOffsetISO(-1, new Date("2020-01-01T00:00:00Z"))).toEqual(
      "2019-12-31"
    )
  })

  it("Day Simple Approach", () => {
    // https://stackoverflow.com/a/21101949/140927
    let date = new Date("1987-12-31T00:02:03")
    let simpleDateInteger =
      date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
    expect(simpleDateInteger).toBe(19871231)
    let fromSimpleDateInteger = new Date(
      simpleDateInteger / 10000, // year
      ((simpleDateInteger / 100) % 100) - 1, // month
      simpleDateInteger % 100 // day
    )
    expect(fromSimpleDateInteger.toDateString()).toEqual(date.toDateString())
  })

  it("Day Continuous Approach", () => {
    let date = new Date("1987-12-31T00:01:02")
    const DAY_IN_MILLISECONDS = 86400 * 1000
    let timeZoneInMilliSeconds = date.getTimezoneOffset() * 60 * 1000
    let continuousDateInteger = Math.floor(
      (date.getTime() - timeZoneInMilliSeconds) / DAY_IN_MILLISECONDS
    )
    expect(continuousDateInteger).toBe(6573)
    let fromContinuousDateInteger = new Date(
      continuousDateInteger * DAY_IN_MILLISECONDS + timeZoneInMilliSeconds
    )
    expect(fromContinuousDateInteger.toDateString()).toEqual(
      date.toDateString()
    )
  })

  it("should convert to Days", () => {
    let date = new Date("1987-12-31T00:02:03")
    let days = daysFromLocalDate(date)
    expect(days).toBe(19871231)
    expect(toDate(days).toDateString()).toEqual(date.toDateString())
  })
})
