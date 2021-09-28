import { getDayOffset, getDayOffsetISO, getDayOffsetYYYYDDMM } from "./time"

describe("Days", () => {
  it("should calc correctly", () => {
    let yesterday = getDayOffset(-1)
    let today = getDayOffset()
    expect(yesterday).toBeLessThan(today)
  })

  it("should respect timezone", () => {
    expect(getDayOffsetYYYYDDMM(-1, new Date("2020-01-01T00:00:00Z"))).toEqual(
      "20191230"
    )
    expect(getDayOffsetISO(-1, new Date("2020-01-01T00:00:00Z"))).toEqual(
      "2019-12-30"
    )
    expect(getDayOffset(-1, new Date("2020-01-01T00:00:00Z"))).toEqual(
      1577746800000
    )
  })
})
