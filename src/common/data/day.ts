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

export function dayToDate(day: DayValue, gmt: boolean = false): Date {
  return gmt
    ? new Date(`${dayToString(day)}T00:00:00.000Z`)
    : new Date(
        day / 10000, // year
        ((day / 100) % 100) - 1, // month
        day % 100 // day
      )
}

export function dayFromToday(): DayValue {
  return dayFromDate(new Date())
}

export function dayFromAny(
  value: DayInput,
  gmt: boolean = false
): DayValue | undefined {
  if (typeof value === "number") {
    if (value < 100) return
    return value
  } else if (typeof value === "string") {
    return dayFromString(value)
  } else if (Array.isArray(value) && value.length === 3) {
    const [year, month, day] = value
    return dayFromParts(year, month, day)
  } else if (value instanceof Date) {
    return dayFromDate(value, gmt)
    // } else if (value instanceof Day) {
    //   return value.days
  }
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

export function dayToString(day: DayValue, sep: string = "-") {
  let baseString = String(day)
  return (
    baseString.slice(0, 4) +
    sep +
    baseString.slice(4, 6) +
    sep +
    baseString.slice(6, 8)
  )
}

export function dayFromParts(
  year: number,
  month: number = 1,
  day: number = 1
): DayValue | undefined {
  if (month < 1 || month > 12 || day < 1 || day > 31) return
  return year * 10000 + month * 100 + day
}

export function dayFromString(value: string): DayValue | undefined {
  const string = String(value)
    .replace(/[^0-9]/g, "")
    .slice(0, 8)
  if (string.length === 8) return +string
}

export function dayMonthStart(day: DayValue, offset: number = 0): DayValue {
  let year = dayYear(day)
  let month = dayMonth(day)
  if (offset !== 0) {
    month += offset
    year += Math.floor((month - 1) / 12)
    month = Math.floor((month - 1) % 12) + 1
    if (month === 0) month = 12
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
  return Math.round((dayToTimestamp(right) - dayToTimestamp(left)) / DAY_MS)
}
