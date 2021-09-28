import {
  DAY_MS,
  getDayOffset,
  getDayOffsetISO,
  getDayOffsetYYYYDDMM,
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
})
