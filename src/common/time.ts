// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

/**
 * @returns Timestamp in miliseconds
 */
export const getTimestamp = (): number =>
  // @ts-ignore
  typeof performance !== "undefined" ? performance.now() : new Date().getTime()

export function formatMilliseconds(ms: number): string {
  return ms > 999 ? (ms / 1000).toFixed(1) + "s" : ms.toFixed(2) + "ms"
}

//

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
