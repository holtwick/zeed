import { type } from "os"

export function daysFromLocalDate(date: Date): number {
  return (
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  )
}

export function daysFromGMTDate(date: Date): number {
  return +date.toISOString().substr(0, 10)
}

export function toDate(n: number): Date {
  return new Date(
    n / 10000, // year
    ((n / 100) % 100) - 1, // month
    n % 100 // day
  )
}

export function toGMTDate(n: number): Date {
  return new Date(`${toDateString(n)}T00:00:00.000Z`)
}

export function toDateNumber(dateString: string): number | undefined {
  if (dateString.length === 10) {
    dateString.replaceAll("-", "")
  }
  if (dateString.length === 8) {
    return +dateString
  }
}

export function toDateString(n: number): string {
  let baseString = String(n)
  return (
    baseString.slice(0, 4) +
    "-" +
    baseString.slice(4, 6) +
    "-" +
    baseString.slice(6, 8)
  )
}

export function forEachDay(
  from: number,
  to: number,
  handler: (date: string) => void
) {
  let start = toGMTDate(from).getTime()
  let end = toGMTDate(to).getTime()
  while (start <= end) {
    handler(new Date(start).toISOString().slice(0, 10))
    start += DAY_MS
  }
}

//

export const DAY_MS = 1000 * 60 * 60 * 24

interface DayOffsetOptions {
  relativeToDate?: Date
  localTime?: boolean
}

/** Relative date calculation based on GMT */
export function getDayOffset<T = number>(
  offset: number = 0,
  relativeToDate: Date = new Date(),
  mode?: (timestamp: number) => T
): T {
  const ms = Math.floor(relativeToDate.getTime() / DAY_MS) * DAY_MS
  const ts = ms + offset * DAY_MS
  if (mode) return mode(ts)
  return ts as any
}

export function getDayOffsetISO(
  offset: number = 0,
  relativeToDate: Date = new Date()
): string {
  return getDayOffset(offset, relativeToDate, (timestamp) =>
    new Date(timestamp).toISOString().substr(0, 10)
  )
}

export function getDayOffsetYYYYDDMM(
  offset: number = 0,
  relativeToDate: Date = new Date()
): string {
  return getDayOffset(
    offset,
    relativeToDate,
    (timestamp) =>
      new Date(timestamp)
        .toISOString()
        .substr(0, 10)
        .replace("-", "")
        .replace("-", "") // replace 2 times OMG
  )
}

export class Day {
  days: number

  constructor(days?: number) {
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
    return new Day(+dateString.replaceAll(/[^0-9]/g, ""))
  }

  static fromDate(date: Date): Day {
    return new Day(
      date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
    )
  }

  static fromDateGMT(date: Date): Day {
    return Day.fromString(date.toISOString().substr(0, 10)) as Day
  }

  static from(value: number | string | Date): Day | undefined {
    if (typeof value === "number") {
      return new Day(value)
    } else if (typeof value === "string") {
      return Day.fromString(value)
    } else if (value instanceof Date) {
      return Day.fromDate(value)
    }
  }

  toNumber(): number {
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

  toDate(): Date {
    return new Date(
      this.days / 10000, // year
      ((this.days / 100) % 100) - 1, // month
      this.days % 100 // day
    )
  }

  toDateGMT() {
    return new Date(`${toDateString(this.days)}T00:00:00.000Z`)
  }

  dayOffset(offset: number): Day {
    return Day.fromDate(new Date(this.toDate().getTime() + offset * DAY_MS))
  }
}
