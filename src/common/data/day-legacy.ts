import { isPromise } from '../exec/promise'
import type { DayInput, DayValue } from './day'
import { DAY_MS } from './day'

// See also and alternatives:
// https://blog.openreplay.com/is-it-time-for-the-javascript-temporal-api
// https://github.com/iamkun/dayjs
// https://github.com/date-fns/date-fns

export type DayInputLegacy = DayInput | Day

/**
 * Date represented as positive integer value. Years smaller 0 are not supported.
 * @deprecated
 */
export class Day {
  days: DayValue

  get value() {
    return this.days
  }

  constructor(days?: DayInputLegacy) {
    if (typeof days === 'number') {
      this.days = days
      return
    }

    if (days != null)
      days = Day.from(days)?.days

    if (days == null) {
      const date = new Date()
      this.days
        = date.getFullYear() * 10000
        + (date.getMonth() + 1) * 100
        + date.getDate()
    }
    else {
      this.days = days
    }
  }

  static fromNumber(n: number): Day {
    return new Day(n)
  }

  static fromString(dateString: string): Day | undefined {
    return Day.from(+dateString.replace(/[^0-9]/g, '').slice(0, 8))
  }

  static fromDate(date: Date, gmt = false): Day {
    return (
      gmt
        ? Day.fromString(date.toISOString().substr(0, 10))
        : Day.from(
          date.getFullYear() * 10000
          + (date.getMonth() + 1) * 100
          + date.getDate(),
        )
    ) as Day
  }

  static fromDateGMT(date: Date): Day {
    return Day.fromDate(date, true)
  }

  static from(value: DayInputLegacy, gmt = false): Day | undefined {
    if (typeof value === 'number') {
      if (value < 100)
        return
      return new Day(value)
    }
    else if (typeof value === 'string') {
      return Day.fromString(value)
    }
    else if (Array.isArray(value) && value.length === 3) {
      const [year, month = 1, day = 1] = value
      if (month < 1 || month > 12 || day < 1 || day > 31)
        return
      return new Day(year * 10000 + month * 100 + day)
    }
    else if (value instanceof Date) {
      return Day.fromDate(value, gmt)
    }
    else if (value instanceof Day) {
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

  toString(sep = '-') {
    const baseString = String(this.days)
    return (
      baseString.slice(0, 4)
      + sep
      + baseString.slice(4, 6)
      + sep
      + baseString.slice(6, 8)
    )
  }

  toDate(gmt = false): Date {
    return gmt
      ? new Date(`${this.toString()}T00:00:00.000Z`)
      : new Date(
        this.days / 10000, // year
        ((this.days / 100) % 100) - 1, // month
        this.days % 100, // day
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
      new Date(this.toDateGMT().getTime() + offset * DAY_MS),
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
    const m = this.month + offset
    let mm = Math.floor((m - 1) % 12) + 1
    if (mm === 0)
      mm = 12
    const yy = Math.floor((m - 1) / 12)
    // log("calc", m, mm, yy, [this.year + yy, mm, this.day])
    return Day.from([this.year + yy, mm, this.day])!
  }

  daysUntil(otherDay: DayInputLegacy): number {
    return Math.round(
      (new Day(otherDay)?.toDateGMT().getTime() - this.toDateGMT().getTime())
      / DAY_MS,
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
  from: DayInputLegacy,
  to: DayInputLegacy,
  handler: (date: Day) => Promise<void> | void,
) {
  let start = Day.from(from)
  const end = Day.from(to)
  // eslint-disable-next-line no-unmodified-loop-condition
  while (start && end && start?.days <= end?.days) {
    const result = handler(start)
    if (isPromise(result))
      await result

    start = start.dayOffset(+1)
  }
}

export function today(): Day {
  return new Day()
}

/** @deprecated */
export function day(days?: DayInputLegacy): Day {
  return new Day(days)
}

export function dateStringToDays(dateString: string): number {
  return Day.fromDate(new Date(dateString)).days
}
