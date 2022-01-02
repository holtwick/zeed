import { isPromise } from "../promise"

// See also and alternatives:
// https://blog.openreplay.com/is-it-time-for-the-javascript-temporal-api
// https://github.com/iamkun/dayjs
// https://github.com/date-fns/date-fns

export const DAY_MS = 1000 * 60 * 60 * 24

export type DayInput = number | string | Date | Day

export class Day {
  days: number

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
    return new Day(+dateString.replace(/[^0-9]/g, ""))
  }

  static fromDate(date: Date, gmt: boolean = false): Day {
    return (
      gmt
        ? Day.fromString(date.toISOString().substr(0, 10))
        : new Day(
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
      return new Day(value)
    } else if (typeof value === "string") {
      return Day.fromString(value)
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

  // Calculations

  dayOffset(offset: number): Day {
    // Important! Don't use local time here due to summer/winter time days can
    // be longer or shorter!
    return Day.fromDateGMT(
      new Date(this.toDateGMT().getTime() + offset * DAY_MS)
    )
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
