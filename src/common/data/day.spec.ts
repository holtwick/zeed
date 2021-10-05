import { Day, forEachDay, today } from "./day"

describe("Days", () => {
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

  it("should iterate days", () => {
    let list: any = []
    forEachDay(20101230, 20110102, (x) => list.push(x.toString()))
    expect(list).toEqual([
      "2010-12-30",
      "2010-12-31",
      "2011-01-01",
      "2011-01-02",
    ])

    let list2: any = []
    forEachDay(19991030, 19991102, (x) => list2.push(x.toString()))
    expect(list2).toMatchInlineSnapshot(`
Array [
  "1999-10-30",
  "1999-10-31",
  "1999-11-01",
  "1999-11-02",
]
`)
  })

  it("should use Day class", () => {
    let day = Day.from(new Date("1987-12-31T00:02:03"))
    expect(day?.days).toEqual(19871231)
    expect(day?.dayOffset(+1).days).toEqual(19880101)
    expect(day?.dayOffset(-1).days).toEqual(19871230)
    expect(day?.toString()).toEqual("1987-12-31")
    expect(day?.toString("")).toEqual("19871231")

    // This only works locally, but not on Github Actions ;)
    // expect(day?.toDate()).toMatchInlineSnapshot(`1987-12-30T23:00:00.000Z`)

    expect(day?.toDateGMT()).toMatchInlineSnapshot(`1987-12-31T00:00:00.000Z`)

    expect(Day.fromString("2000-01-01")?.days).toEqual(20000101)

    let day2 = Day.fromDateGMT(new Date("1987-12-31T00:02:03"))
    expect(day2?.days).toEqual(19871230)

    // expect(new Date().toISOString().startsWith(today().toString())).toBe(true)
  })
})
