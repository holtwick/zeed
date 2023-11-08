import {
  dayDiff,
  dayFromDate,
  dayFromString,
  dayIterator,
  dayMonthStart,
  dayOffset,
  dayRange,
  dayToParts,
  dayToString,
  dayYearStart,
} from './day'
import { Day, dateStringToDays, forEachDay } from './day-legacy'

describe('days', () => {
  it('day Simple Approach', () => {
    // https://stackoverflow.com/a/21101949/140927
    const date = new Date('1987-12-31T00:02:03')
    const simpleDateInteger
      = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
    expect(simpleDateInteger).toBe(19871231)
    const fromSimpleDateInteger = new Date(
      simpleDateInteger / 10000, // year
      ((simpleDateInteger / 100) % 100) - 1, // month
      simpleDateInteger % 100, // day
    )
    expect(fromSimpleDateInteger.toDateString()).toEqual(date.toDateString())
  })

  it('day Continuous Approach', () => {
    const date = new Date('1987-12-31T00:01:02')
    const DAY_IN_MILLISECONDS = 86400 * 1000
    const timeZoneInMilliSeconds = date.getTimezoneOffset() * 60 * 1000
    const continuousDateInteger = Math.floor(
      (date.getTime() - timeZoneInMilliSeconds) / DAY_IN_MILLISECONDS,
    )
    expect(continuousDateInteger).toBe(6573)
    const fromContinuousDateInteger = new Date(
      continuousDateInteger * DAY_IN_MILLISECONDS + timeZoneInMilliSeconds,
    )
    expect(fromContinuousDateInteger.toDateString()).toEqual(
      date.toDateString(),
    )
  })

  it('should iterate days', () => {
    const list: any = []
    forEachDay(20101230, 20110102, x => list.push(x.toString()))
    expect(list).toEqual([
      '2010-12-30',
      '2010-12-31',
      '2011-01-01',
      '2011-01-02',
    ])

    const list2: any = []
    forEachDay(19991030, 19991102, x => list2.push(x.toString()))
    expect(list2).toEqual([
      '1999-10-30',
      '1999-10-31',
      '1999-11-01',
      '1999-11-02',
    ])
  })

  it('should use Day class', () => {
    {
      const day = Day.from(new Date('1987-12-31T00:02:03'))
      expect(day?.days).toEqual(19871231)
      expect(day?.dayOffset(+1).days).toEqual(19880101)
      expect(day?.dayOffset(-1).days).toEqual(19871230)
      expect(day?.toString()).toEqual('1987-12-31')
      expect(day?.toString('')).toEqual('19871231')

      // This only works locally, but not on Github Actions ;)
      // expect(day?.toDate()).toEqual(`1987-12-30T23:00:00.000Z`)

      expect(day?.toDateGMT()).toEqual(new Date('1987-12-31T00:00:00.000Z'))

      expect(Day.fromString('2000-01-01')?.days).toEqual(20000101)

      expect(Day.fromString('2000-01-01')?.daysUntil(19871231)).toBe(-4384)
      expect(Day.fromString('2000-01-01')?.daysUntil('2000-01-31')).toBe(30)
      expect(Day.fromString('2021-01-01')?.daysUntil('2021-03-01')).toBe(59)
      expect(Day.fromString('2020-01-01')?.daysUntil('2020-03-01')).toBe(60)

      expect(Day.from([2022, 12, 31])?.days).toBe(20221231)

      // Following depend on timezone
      // let day2 = Day.fromDateGMT(new Date("1987-12-31T00:02:03"))
      // expect(day2?.days).toEqual(19871230)
      // expect(new Date().toISOString().startsWith(today().toString())).toBe(true)
    }
    {
      const day = dayFromDate(new Date('1987-12-31T00:02:03'))
      expect(day).toEqual(19871231)
      expect(dayOffset(day, +1)).toEqual(19880101)
      expect(dayOffset(day, -1)).toEqual(19871230)
      expect(dayToString(day)).toEqual('1987-12-31')
      expect(dayToString(day, '')).toEqual('19871231')

      // This only works locally, but not on Github Actions ;)
      // expect(day?.toDate()).toEqual(`1987-12-30T23:00:00.000Z`)

      // expect(day?.toDateGMT()).toEqual(new Date("1987-12-31T00:00:00.000Z"))

      // expect(Day.fromString("2000-01-01")?.days).toEqual(20000101)

      expect(dayDiff(20000101, 19871231)).toBe(-4384)
      expect(dayDiff(20000101, 20000131)).toBe(30)
      expect(dayDiff(20210101, 20210301)).toBe(59)
      expect(dayDiff(20200101, 20200301)).toBe(60)

      // expect(Day.from([2022, 12, 31])?.days).toBe(20221231)

      // Following depend on timezone
      // let day2 = Day.fromDateGMT(new Date("1987-12-31T00:02:03"))
      // expect(day2?.days).toEqual(19871230)
      // expect(new Date().toISOString().startsWith(today().toString())).toBe(true)
    }
  })

  it('should properties', () => {
    const d = Day.fromString('2021-12-31')!
    expect(d.days).toEqual(20211231)
    expect(d.day).toEqual(31)
    expect(d.month).toEqual(12)
    expect(d.year).toEqual(2021)
  })

  it('should calc months', () => {
    {
      const d = Day.fromString('2021-12-01')!
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
      const d = dayFromString('1999-12-31')!
      expect(d).toMatchInlineSnapshot('19991231')
      expect(dayToParts(d)).toMatchInlineSnapshot(`
        Array [
          1999,
          12,
          31,
        ]
      `)
      expect(dayMonthStart(d)).toMatchInlineSnapshot('19991201')
      expect(dayMonthStart(d, +1)).toMatchInlineSnapshot('20000101')
      expect(dayMonthStart(d, +2)).toMatchInlineSnapshot('20000201')
      expect(dayMonthStart(d, +11)).toMatchInlineSnapshot('20001101')
      expect(dayMonthStart(d, +12)).toMatchInlineSnapshot('20001201')
      expect(dayMonthStart(d, +24)).toMatchInlineSnapshot('20011201')
      expect(dayMonthStart(d, -1)).toMatchInlineSnapshot('19991101')
      expect(dayMonthStart(d, -2)).toMatchInlineSnapshot('19991001')
      expect(dayMonthStart(d, -11)).toMatchInlineSnapshot('19990101')
      expect(dayMonthStart(d, -24)).toMatchInlineSnapshot('19971201')

      expect(dayYearStart(d)).toMatchInlineSnapshot('19990101')
      expect(dayYearStart(d, -10)).toMatchInlineSnapshot('19890101')
      expect(dayYearStart(d, +10)).toMatchInlineSnapshot('20090101')
    }
  })

  it('should parse date string', () => {
    expect(new Date('2019-08-05T13:14:31.000Z').toISOString()).toEqual(
      '2019-08-05T13:14:31.000Z',
    )
    expect(dateStringToDays('2019-08-05T13:14:31.000Z')).toBe(20190805)
  })

  it('should start', () => {
    const d = Day.fromString('2021-12-31')!
    expect(d.yearStart().days).toBe(20210101)
    expect(d.monthStart().days).toBe(20211201)
  })

  it('should dayFromString', () => {
    expect(dayFromString('20121030')).toEqual(20121030)
    expect(dayFromString('2012-10-30T12:00:00Z')).toEqual(20121030)
    expect(dayFromString('fasfasdf sadf ')).toEqual(undefined)
  })

  it('should dayRange', () => {
    expect(dayRange(20121230, 20130104)).toMatchInlineSnapshot(`
      Array [
        20121230,
        20121231,
        20130101,
        20130102,
        20130103,
        20130104,
      ]
    `)

    expect(dayRange(-6, 20130104)).toMatchInlineSnapshot(`
      Array [
        20121230,
        20121231,
        20130101,
        20130102,
        20130103,
        20130104,
      ]
    `)

    expect(dayIterator(-6, 20130104).next().value).toEqual(20121230)
  })
})
