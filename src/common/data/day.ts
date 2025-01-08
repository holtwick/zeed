// Functional Variant

export const DAY_MS = 86400000 // 1000 * 60 * 60 * 24

export type DayValue = number

export type DayInput =
  | DayValue
  | number
  | string
  | Date
  | [number, number?, number?]

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

export function dayToDate(day: DayValue, utc = false): Date {
  return utc
    ? new Date(`${dayToString(day)}T00:00:00.000Z`)
    : new Date(
      day / 10000, // year
      Math.max(0, ((day / 100) % 100) - 1), // month
      Math.max(1, day % 100), // day
    )
}

export function dayFromToday(): DayValue {
  return dayFromDate(new Date())
}

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

export function dayToDateUTC(day: DayValue): Date {
  return dayToDate(day, true)
}

/** @deprecated use dayToDateUTC */
export function dayToDateGMT(day: DayValue): Date {
  return dayToDate(day, true)
}

export function dayFromDate(date: Date, utc = false): DayValue {
  return (
    utc
      ? dayFromString(date.toISOString())
      : date.getFullYear() * 10000
      + (date.getMonth() + 1) * 100
      + date.getDate()
  )!
}

export function dayFromDateUTC(date: Date): DayValue {
  return dayFromDate(date, true)
}

/** @deprecated use dayFromDateUTC */
export function dayFromDateGMT(date: Date): DayValue {
  return dayFromDate(date, true)
}


export function dayToTimestampSeconds(day: DayValue, utc = true): number {
  return Math.floor(dayToDate(day, utc).getTime() / 1000)
}

/// Timestamp in miliseconds
export function dayToTimestamp(day: DayValue, utc = true): number {
  return dayToDate(day, utc).getTime()
}

/// Timestamp in miliseconds
export function dayFromTimestamp(ms: number, utc = true): DayValue {
  return dayFromDate(new Date(ms), utc)
}

export function dayFromTimestampSeconds(ms: number, utc = true): DayValue {
  return dayFromDate(new Date(Math.floor(ms * 1000)), utc) 
}

export function dayToString(day: DayValue, sep = '-') {
  const baseString = String(day)
  return (
    baseString.slice(0, 4) + sep
    + baseString.slice(4, 6) + sep
    + baseString.slice(6, 8)
  )
}

/// Day value from parts, returns undefined if invalid
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
export function dayFromString(value: string): DayValue | undefined {
  const string = String(value)
    .replace(/\D/g, '')
    .slice(0, 8)
  if (string.length === 8)
    return +string
}

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

export function dayYearStart(day: DayValue, offset = 0): DayValue {
  const year = dayYear(day)
  return dayFromParts(year + offset, 1, 1)!
}

export function dayOffset(day: DayValue, offset: number): DayValue {
  // Important! Don't use local time here due to summer/winter time days can
  // be longer or shorter!
  return dayFromTimestamp(dayToTimestamp(day) + offset * DAY_MS)
}

export function dayDiff(left: DayValue, right: DayValue): number {
  return Math.round((dayToTimestamp(right) - dayToTimestamp(left)) / DAY_MS)
}

/** List of dates for loops */
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
