import { TIME_DAY_MS } from "../time"

// Functionality variant
let testModeDay: number | undefined

/**
 * Enable test mode for date functions by forcing "today" to a fixed day value.
 *
 * Use a numeric DayValue like 20000101 (YYYYMMDD). This is intended for tests
 * to make date-based logic deterministic. Call with no args to reset.
 *
 * @param ts - day to use as "today" in YYYYMMDD format (default: 20000101)
 */
export function setDayTest(ts = 20000101) {
  testModeDay = ts
}

/** 
 * @deprecated use TIME_DAY_MS
 * Number of milliseconds in one calendar day (24 * 60 * 60 * 1000). */
export const DAY_MS = TIME_DAY_MS // 1000 * 60 * 60 * 24

/** DayValue is a numeric date encoded as YYYYMMDD (for example 20250907). */
export type DayValue = number

/**
 * Accepted inputs for day conversion helpers.
 * - DayValue or number: a YYYYMMDD numeric value
 * - string: a date string (parsed by digits)
 * - Date: JavaScript Date
 * - [year, month?, day?]: numeric parts
 */
export type DayInput =
  | DayValue
  | number
  | string
  | Date
  | [number, number?, number?]

/**
 * Extract the year (YYYY) from a DayValue.
 *
 * @param day - day as YYYYMMDD
 * @returns year as number (e.g. 2025)
 */
export function dayYear(day: DayValue): DayValue {
  return Math.floor(day / 10000)
}

/**
 * Extract the month (1-12) from a DayValue.
 *
 * @param day - day as YYYYMMDD
 * @returns month number (1-12)
 */
export function dayMonth(day: DayValue): DayValue {
  return Math.floor((day / 100) % 100)
}

/**
 * Extract the day of month (1-31) from a DayValue.
 *
 * @param day - day as YYYYMMDD
 * @returns day of month (1-31)
 */
export function dayDay(day: DayValue): DayValue {
  return Math.floor(day % 100)
}

/**
 * Split a DayValue into [year, month, day].
 *
 * @param day - day as YYYYMMDD
 * @returns tuple [year, month, day]
 */
export function dayToParts(day: DayValue): [number, number, number] {
  return [dayYear(day), dayMonth(day), dayDay(day)]
}

/**
 * Convert a DayValue to a JavaScript Date.
 *
 * By default returns a local Date at midnight for the day. If `utc` is true
 * the returned Date represents midnight UTC for that day.
 *
 * @param day - day as YYYYMMDD
 * @param utc - whether to construct the Date in UTC (default: false)
 * @returns Date object for the given day
 */
export function dayToDate(day: DayValue, utc = false): Date {
  return utc
    ? new Date(`${dayToString(day)}T00:00:00.000Z`)
    : new Date(
      day / 10000, // year
      Math.max(0, ((day / 100) % 100) - 1), // month
      Math.max(1, day % 100), // day
    )
}

/**
 * Return today's day as a DayValue (YYYYMMDD).
 *
 * If test mode has been enabled via `setDayTest` this returns the forced
 * value instead. Otherwise it uses the current local date.
 */
export function dayFromToday(): DayValue {
  return testModeDay ?? dayFromDate(new Date())
}

/**
 * Convert multiple input types to a DayValue (YYYYMMDD).
 *
 * Supports numbers (DayValue), strings, Date objects and [year, month?, day?]
 * tuples. Returns undefined for invalid or unsupported values.
 *
 * @param value - input to convert
 * @param utc - when converting from Date, interpret as UTC if true
 */
export function dayFromAny(
  value: DayInput,
  utc = false,
): DayValue | undefined {
  if (typeof value === 'number') {
    if (value < 100)
      return
    return value
  }
  else if (typeof value === 'string') {
    return dayFromString(value)
  }
  else if (Array.isArray(value) && value.length >= 1) {
    return dayFromParts(...value)
  }
  else if (value instanceof Date) {
    return dayFromDate(value, utc)
    // } else if (value instanceof Day) {
    //   return value.days
  }
}

/** Convert a DayValue to a Date at midnight UTC. */
export function dayToDateUTC(day: DayValue): Date {
  return dayToDate(day, true)
}

/**
 * @deprecated use dayToDateUTC
 *
 * Kept for backwards compatibility; returns a Date for midnight UTC.
 */
export function dayToDateGMT(day: DayValue): Date {
  return dayToDate(day, true)
}

/**
 * Convert a JavaScript Date to a DayValue (YYYYMMDD).
 *
 * If `utc` is true the function uses the ISO string representation to
 * calculate the day in UTC. Otherwise it uses local date components.
 */
export function dayFromDate(date: Date, utc = false): DayValue {
  return (
    utc
      ? dayFromString(date.toISOString())
      : date.getFullYear() * 10000
      + (date.getMonth() + 1) * 100
      + date.getDate()
  )!
}

/** Convert a Date to DayValue using UTC. */
export function dayFromDateUTC(date: Date): DayValue {
  return dayFromDate(date, true)
}

/** @deprecated use dayFromDateUTC */
/**
 * Deprecated: use `dayFromDateUTC`.
 *
 * Kept for backwards compatibility; converts a Date to a UTC DayValue.
 */
export function dayFromDateGMT(date: Date): DayValue {
  return dayFromDate(date, true)
}


/**
 * Convert a DayValue to a UNIX timestamp in seconds. Returns seconds since
 * epoch for midnight of the given day. Defaults to UTC.
 */
export function dayToTimestampSeconds(day: DayValue, utc = true): number {
  return Math.floor(dayToDate(day, utc).getTime() / 1000)
}

/**
 * Convert a DayValue to a timestamp in milliseconds for midnight of that day.
 * Defaults to UTC when constructing the Date.
 */
export function dayToTimestamp(day: DayValue, utc = true): number {
  return dayToDate(day, utc).getTime()
}

/**
 * Convert a timestamp in milliseconds to a DayValue. The timestamp is turned
 * into a Date and then converted; `utc` controls interpretation.
 */
export function dayFromTimestamp(ms: number, utc = true): DayValue {
  return dayFromDate(new Date(ms), utc)
}

/**
 * Convert a UNIX timestamp in seconds to a DayValue.
 *
 * @param ms - seconds since epoch
 */
export function dayFromTimestampSeconds(ms: number, utc = true): DayValue {
  return dayFromDate(new Date(Math.floor(ms * 1000)), utc)
}

/**
 * Format a DayValue as a string with an optional separator.
 *
 * Example: dayToString(20250907) -> "2025-09-07"
 */
export function dayToString(day: DayValue, sep = '-') {
  const baseString = String(day)
  return (
    baseString.slice(0, 4) + sep
    + baseString.slice(4, 6) + sep
    + baseString.slice(6, 8)
  )
}

/// Day value from parts, returns undefined if invalid
/**
 * Build a DayValue from numeric parts. Returns undefined for invalid parts.
 *
 * @param year - full year (e.g. 2025)
 * @param month - 1-12 (default 1)
 * @param day - 1-31 (default 1)
 */
export function dayFromParts(
  year: number,
  month = 1,
  day = 1,
): DayValue | undefined {
  if (month < 1 || month > 12 || day < 1 || day > 31)
    return
  return year * 10000 + month * 100 + day
}

/// Day value from string, returns undefined if invalid
/**
 * Parse a string into a DayValue by extracting up to 8 digits (YYYYMMDD).
 * Returns undefined for invalid results.
 */
export function dayFromString(value: string): DayValue | undefined {
  const string = String(value)
    .replace(/\D/g, '')
    .slice(0, 8)
  if (string.length === 8)
    return +string
}

/**
 * Return the first day of the month for the given DayValue. An optional
 * `offset` (positive or negative) moves the result by months.
 *
 * @param day - source DayValue
 * @param offset - months to offset (default 0)
 */
export function dayMonthStart(day: DayValue, offset = 0): DayValue {
  let year = dayYear(day)
  let month = dayMonth(day)
  if (offset !== 0) {
    month += offset
    year += Math.floor((month - 1) / 12)
    month = Math.floor((month - 1) % 12) + 1
    if (month === 0)
      month = 12
  }
  return dayFromParts(year, month, 1)!
}

/**
 * Return the first day of the year for the given DayValue. `offset` moves
 * the year by the given amount.
 */
export function dayYearStart(day: DayValue, offset = 0): DayValue {
  const year = dayYear(day)
  return dayFromParts(year + offset, 1, 1)!
}

/**
 * Offset a DayValue by a number of days. Uses timestamp math to avoid local
 * DST issues.
 *
 * @param day - source DayValue
 * @param offset - days to add (negative to subtract)
 */
export function dayOffset(day: DayValue, offset: number): DayValue {
  // Important! Don't use local time here due to summer/winter time days can
  // be longer or shorter!
  return dayFromTimestamp(dayToTimestamp(day) + offset * TIME_DAY_MS)
}

/**
 * Compute the difference in whole days between two DayValues (right - left).
 */
export function dayDiff(left: DayValue, right: DayValue): number {
  return Math.round((dayToTimestamp(right) - dayToTimestamp(left)) / TIME_DAY_MS)
}

/**
 * Return an array of DayValues from left to right (inclusive).
 *
 * If `right` is omitted it defaults to today. If `left` is negative it is
 * interpreted as an offset relative to `right` (e.g. -7 means the last 7 days).
 */
export function dayRange(left: DayValue, right?: DayValue): number[] {
  const list: number[] = []

  if (right == null)
    right = dayFromToday()

  if (left < 0)
    left = dayOffset(right, left + 1)

  while (left <= right) {
    list.push(left)
    left = dayOffset(left, +1)
  }
  return list
}

/** Iterator, see dayRange */
/**
 * Generator that yields DayValues from left to right (inclusive). Same rules
 * as `dayRange` regarding defaults and negative left values.
 */
export function* dayIterator(left: DayValue, right?: DayValue) {
  const list: number[] = []

  if (right == null)
    right = dayFromToday()

  if (left < 0)
    left = dayOffset(right, left + 1)

  while (left <= right) {
    yield left
    left = dayOffset(left, +1)
  }
  return list
}

