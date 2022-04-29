import {
  dateStringToDays,
  Day,
  dayFromString,
  dayMonthStart,
  dayToParts,
  forEachDay,
} from "./day"

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
    expect(list2).toEqual([
      "1999-10-30",
      "1999-10-31",
      "1999-11-01",
      "1999-11-02",
    ])
  })

  it("should use Day class", () => {
    let day = Day.from(new Date("1987-12-31T00:02:03"))
    expect(day?.days).toEqual(19871231)
    expect(day?.dayOffset(+1).days).toEqual(19880101)
    expect(day?.dayOffset(-1).days).toEqual(19871230)
    expect(day?.toString()).toEqual("1987-12-31")
    expect(day?.toString("")).toEqual("19871231")

    // This only works locally, but not on Github Actions ;)
    // expect(day?.toDate()).toEqual(`1987-12-30T23:00:00.000Z`)

    expect(day?.toDateGMT()).toEqual(new Date("1987-12-31T00:00:00.000Z"))

    expect(Day.fromString("2000-01-01")?.days).toEqual(20000101)

    expect(Day.fromString("2000-01-01")?.daysUntil(19871231)).toBe(-4384)
    expect(Day.fromString("2000-01-01")?.daysUntil("2000-01-31")).toBe(30)
    expect(Day.fromString("2021-01-01")?.daysUntil("2021-03-01")).toBe(59)
    expect(Day.fromString("2020-01-01")?.daysUntil("2020-03-01")).toBe(60)

    expect(Day.from([2022, 12, 31])?.days).toBe(20221231)

    // Following depend on timezone
    // let day2 = Day.fromDateGMT(new Date("1987-12-31T00:02:03"))
    // expect(day2?.days).toEqual(19871230)
    // expect(new Date().toISOString().startsWith(today().toString())).toBe(true)
  })

  it("should properties", () => {
    let d = Day.fromString("2021-12-31")!
    expect(d.days).toEqual(20211231)
    expect(d.day).toEqual(31)
    expect(d.month).toEqual(12)
    expect(d.year).toEqual(2021)
  })

  it("should calc months", () => {
    {
      let d = Day.fromString("2021-12-01")!
      expect(d.monthOffset(0)?.days).toBe(20211201)
      expect(d.monthOffset(+1)?.days).toBe(20220101)
      expect(d.monthOffset(+2)?.days).toBe(20220201)
      expect(d.monthOffset(+11)?.days).toBe(20221101)
      expect(d.monthOffset(+24)?.days).toBe(20231201)
      expect(d.monthOffset(-1)?.days).toBe(20211101)
      expect(d.monthOffset(-2)?.days).toBe(20211001)
      expect(d.monthOffset(-11)?.days).toBe(20210101)
      expect(d.monthOffset(-24)?.days).toBe(20191201)
    }
    {
      let d = dayFromString("1999-12-31")!
      expect(d).toMatchInlineSnapshot("19991231")
      expect(dayToParts(d)).toMatchInlineSnapshot(`
        [
          1999,
          12,
          31,
        ]
      `)
      expect(dayMonthStart(d, 0)).toMatchInlineSnapshot("19991201")
      expect(dayMonthStart(d, +1)).toMatchInlineSnapshot("20000101")
      expect(dayMonthStart(d, +2)).toMatchInlineSnapshot("20000201")
      expect(dayMonthStart(d, +11)).toMatchInlineSnapshot("20001101")
      expect(dayMonthStart(d, +12)).toMatchInlineSnapshot("20001201")
      expect(dayMonthStart(d, +24)).toMatchInlineSnapshot('20011201')
      expect(dayMonthStart(d, -1)).toMatchInlineSnapshot("19991101")
      expect(dayMonthStart(d, -2)).toMatchInlineSnapshot("19991001")
      expect(dayMonthStart(d, -11)).toMatchInlineSnapshot("19990101")
      expect(dayMonthStart(d, -24)).toMatchInlineSnapshot('19971201')
    }
  })

  it("should parse date string", () => {
    expect(new Date("2019-08-05T13:14:31.000Z").toISOString()).toEqual(
      "2019-08-05T13:14:31.000Z"
    )
    expect(dateStringToDays("2019-08-05T13:14:31.000Z")).toBe(20190805)
  })

  it("should start", () => {
    let d = Day.fromString("2021-12-31")!
    expect(d.yearStart().days).toBe(20210101)
    expect(d.monthStart().days).toBe(20211201)
  })
})
