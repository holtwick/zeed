import { isPromise } from "../exec/promise"

// See also and alternatives:
// https://blog.openreplay.com/is-it-time-for-the-javascript-temporal-api
// https://github.com/iamkun/dayjs
// https://github.com/date-fns/date-fns

export const DAY_MS = 86400000 // 1000 * 60 * 60 * 24

export type DayInput = number | string | Date | Day | [number, number, number]

/** Date represented as positive integer value. Years smaller 0 are not supported.  */
export class Day {
  days: number

  get value() {
    return this.days
  }

  constructor(days?: DayInput) {
    if (typeof days === "number") {
      this.days = days
      return
    }

    if (days != null) {
      days = Day.from(days)?.days
    }

    if (days == null) {
      const date = new Date()
      this.days =
        date.getFullYear() * 10000 +
        (date.getMonth() + 1) * 100 +
        date.getDate()
    } else {
      this.days = days
    }
  }

  static fromNumber(n: number): Day {
    return new Day(n)
  }

  static fromString(dateString: string): Day | undefined {
    return Day.from(+dateString.replace(/[^0-9]/g, "").slice(0, 8))
  }

  static fromDate(date: Date, gmt: boolean = false): Day {
    return (
      gmt
        ? Day.fromString(date.toISOString().substr(0, 10))
        : Day.from(
            date.getFullYear() * 10000 +
              (date.getMonth() + 1) * 100 +
              date.getDate()
          )
    ) as Day
  }

  static fromDateGMT(date: Date): Day {
    return Day.fromDate(date, true)
  }

  static from(value: DayInput, gmt: boolean = false): Day | undefined {
    if (typeof value === "number") {
      if (value < 100) return
      return new Day(value)
    } else if (typeof value === "string") {
      return Day.fromString(value)
    } else if (Array.isArray(value) && value.length === 3) {
      const [year, month, day] = value
      if (month < 1 || month > 12 || day < 1 || day > 31) return
      return new Day(year * 10000 + month * 100 + day)
    } else if (value instanceof Date) {
      return Day.fromDate(value, gmt)
    } else if (value instanceof Day) {
      return value
    }
  }

  toNumber(): number {
    return this.days
  }

  // Transformer

  /** Just for future extensions */
  toJson() {
    return this.days
  }

  toString(sep: string = "-") {
    let baseString = String(this.days)
    return (
      baseString.slice(0, 4) +
      sep +
      baseString.slice(4, 6) +
      sep +
      baseString.slice(6, 8)
    )
  }

  toDate(gmt: boolean = false): Date {
    return gmt
      ? new Date(`${this.toString()}T00:00:00.000Z`)
      : new Date(
          this.days / 10000, // year
          ((this.days / 100) % 100) - 1, // month
          this.days % 100 // day
        )
  }

  toDateGMT() {
    return this.toDate(true)
  }

  get year() {
    return Math.floor(this.days / 10000)
  }

  get month() {
    return Math.floor((this.days / 100) % 100)
  }

  get day() {
    return Math.floor(this.days % 100)
  }

  // Calculations

  dayOffset(offset: number): Day {
    // Important! Don't use local time here due to summer/winter time days can
    // be longer or shorter!
    return Day.fromDateGMT(
      new Date(this.toDateGMT().getTime() + offset * DAY_MS)
    )
  }

  monthStart(): Day {
    return Day.from([this.year, this.month, 1])!
  }

  yearStart(): Day {
    return Day.from([this.year, 1, 1])!
  }

  /** Very stupid approach, only works for days <= 28 */
  monthOffset(offset: number): Day {
    let m = this.month + offset
    let mm = Math.floor((m - 1) % 12) + 1
    if (mm === 0) mm = 12
    let yy = Math.floor((m - 1) / 12)
    // log("calc", m, mm, yy, [this.year + yy, mm, this.day])
    return Day.from([this.year + yy, mm, this.day])!
  }

  daysUntil(otherDay: DayInput): number {
    return Math.round(
      (new Day(otherDay)?.toDateGMT().getTime() - this.toDateGMT().getTime()) /
        DAY_MS
    )
  }

  // Shortcuts

  yesterday() {
    return this.dayOffset(-1)
  }

  tomorrow() {
    return this.dayOffset(+1)
  }
}

export async function forEachDay(
  from: DayInput,
  to: DayInput,
  handler: (date: Day) => Promise<void> | void
) {
  let start = Day.from(from)
  let end = Day.from(to)
  while (start && end && start?.days <= end?.days) {
    let result = handler(start)
    if (isPromise(result)) {
      await result
    }
    start = start.dayOffset(+1)
  }
}

export function today(): Day {
  return new Day()
}

export function day(days?: DayInput): Day {
  return new Day(days)
}

export function dateStringToDays(dateString: string): number {
  return Day.fromDate(new Date(dateString)).days
}

// Functional Variant

export type DayValue = number

export function dayYear(day: DayValue): DayValue {
  return Math.floor(day / 10000)
}

export function dayMonth(day: DayValue): DayValue {
  return Math.floor((day / 100) % 100)
}

export function dayDay(day: DayValue): DayValue {
  return Math.floor(day % 100)
}

export function dayToParts(day: DayValue): [number, number, number] {
  return [dayYear(day), dayMonth(day), dayDay(day)]
}

export function dayToDate(day: DayValue, gmt: boolean = false): Date {
  return gmt
    ? new Date(`${day.toString()}T00:00:00.000Z`)
    : new Date(
        day / 10000, // year
        ((day / 100) % 100) - 1, // month
        day % 100 // day
      )
}

export function dayFromToday(): DayValue {
  return dayFromDate(new Date())
}

export function dayToDateGMT(day: DayValue): Date {
  return dayToDate(day, true)
}

export function dayFromDate(date: Date, gmt: boolean = false): DayValue {
  return (
    gmt
      ? dayFromString(date.toISOString())
      : date.getFullYear() * 10000 +
        (date.getMonth() + 1) * 100 +
        date.getDate()
  )!
}

export function dayFromDateGMT(date: Date): DayValue {
  return dayFromDate(date, true)
}

export function dayToTimestamp(day: DayValue, gmt: boolean = true): number {
  return dayToDate(day, gmt).getTime()
}

export function dayFromTimestamp(ms: number, gmt: boolean = true): DayValue {
  return dayFromDate(new Date(ms), gmt)
}

export function dayFromParts(
  year: number,
  month: number,
  day: number
): DayValue | undefined {
  if (month < 1 || month > 12 || day < 1 || day > 31) return
  return year * 10000 + month * 100 + day
}

export function dayFromString(value: string): DayValue | undefined {
  const string = value.replace(/[^0-9]/g, "").slice(0, 8)
  if (string.length === 8) return +value
}

export function dayMonthStart(day: DayValue, offset: number = 0): DayValue {
  let year = dayYear(day)
  let month = dayMonth(day)
  if (offset !== 0) {
    month += offset
    month = Math.floor((month - 1) % 12) + 1
    if (month === 0) month = 12
    year += Math.floor((month - 1) / 12)
  }
  return dayFromParts(year, month, 1)!
}

export function dayYearStart(day: DayValue, offset: number = 0): DayValue {
  let year = dayYear(day)
  return dayFromParts(year + offset, 1, 1)!
}

export function dayOffset(day: DayValue, offset: number): DayValue {
  // Important! Don't use local time here due to summer/winter time days can
  // be longer or shorter!
  return dayFromTimestamp(dayToTimestamp(day) + offset * DAY_MS)
}

export function dayDiff(left: DayValue, right: DayValue): number {
  return Math.round(dayToTimestamp(right) - dayToTimestamp(left) / DAY_MS)
}
