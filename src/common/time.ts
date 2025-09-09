import { base32ToNumber, numberToBase32 } from './data/math'

let testModeTime: number | undefined

/**
 * Set a fixed timestamp (ms since epoch) used by `getTimestamp` for tests.
 *
 * Pass a millisecond timestamp (for example created with Date.UTC) to force
 * time-based helpers to return deterministic values during tests.
 *
 * @param ts - timestamp in milliseconds (defaults to 2000-01-01T00:00:00.000Z)
 */
export function setTimestampTest(ts = Date.UTC(2000, 0, 1, 0, 0, 0, 0)) {
  testModeTime = ts
}

/**
 * Return the current timestamp in milliseconds.
 *
 * In test mode (when `setTimestampTest` was called) the forced value is
 * returned instead of the real current time.
 *
 * @returns timestamp in milliseconds
 */
export function getTimestamp(): number {
  return testModeTime ?? Date.now()
}

/**
 * Return the current timestamp in seconds.
 *
 * Uses `getTimestamp()` which can be overridden for tests with
 * `setTimestampTest`.
 *
 * @returns timestamp in whole seconds (integer)
 */
export function getTimestampInSeconds(): number {
  return Math.floor(getTimestamp() / 1000)
}

/**
 * Convert a UNIX timestamp in seconds to a JavaScript Date.
 *
 * @param ts - seconds since epoch
 * @returns Date instance corresponding to the provided seconds
 */
export function dateFromSeconds(ts: number): Date {
  return new Date(ts * 1000)
}

// typeof performance !== "undefined" ? performance.now() : new Date().getTime()

/**
 * Format a millisecond duration into a human readable string.
 *
 * - Values >= 1000ms are shown in seconds with one decimal (e.g. "1.2 s").
 * - Smaller values are shown in milliseconds with two decimals (e.g. "123.45 ms").
 *
 * @param ms - duration in milliseconds
 * @returns formatted duration string
 */
export function formatMilliseconds(ms: number): string {
  return ms > 999 ? `${(ms / 1000).toFixed(1)} s` : `${ms.toFixed(2)} ms`
}

/**
 * Parses the given date candidates and returns the first valid Date object found.
 *
 * @param dateCandidates - The date candidates to parse, which can be either strings or Date objects.
 * @returns The parsed Date object, or undefined if no valid date is found.
 */
export function parseDate(
  ...dateCandidates: (string | Date)[]
): Date | undefined {
  for (const dateCandidate of dateCandidates) {
    if (dateCandidate instanceof Date)
      return dateCandidate

    if (typeof dateCandidate === 'string') {
      let date = null
      if (dateCandidate.includes(':')) {
        try {
          date = new Date(dateCandidate)
        }
        catch (err) {}
      }
      if (!(date instanceof Date)) {
        const m = /(\d\d\d\d)-(\d\d)-(\d\d)/.exec(dateCandidate)
        if (m)
          date = new Date(+m[1], +m[2] - 1, +m[3], 12, 0)
      }
      if (date instanceof Date)
        return date
    }
  }
}

/**
 * Return a high-resolution timestamp in milliseconds.
 *
 * Uses the `performance.now()` clock when available (monotonic, high
 * resolution), otherwise falls back to `Date.now()`.
 *
 * @returns timestamp in milliseconds (relative for performance.now, epoch for Date.now)
 */
export function getPerformanceTimestamp(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

/**
 * Create a simple duration reporter.
 *
 * Returns a function that, when called, reports the elapsed time since
 * `duration()` was called. The returned string is formatted via
 * `formatMilliseconds`.
 *
 * Example: const t = duration(); // do work...; console.log(t());
 *
 * @returns a zero-argument function that returns the elapsed time string
 */
export function duration(): () => string {
  const t0 = getPerformanceTimestamp()

  return function (): string {
    const duration = getPerformanceTimestamp() - t0
    return formatMilliseconds(duration)

    // if (duration > 500)
    //   return `${(duration / 1000).toFixed(4)}s`

    // // https://elijahmanor.com/format-js-numbers
    // // https://tc39.es/proposal-unified-intl-numberformat/section6/locales-currencies-tz_proposed_out.html#sec-issanctionedsimpleunitidentifier
    // return duration.toLocaleString('en-US', {
    //   style: 'unit',
    //   unit: 'millisecond',
    //   notation: 'compact',
    //   compactDisplay: 'long',
    // })
  }
}

/**
 * If you parsed a date string that didn't include a time zone, adjust the
 * naive UTC components into a local Date with the same Y/M/D/H/M/S values.
 *
 * This effectively treats the input as if it already represented local time
 * and builds a corresponding Date using the local timezone.
 */
export function datetimeToLocal(fromDate: Date): Date {
  return new Date(
    fromDate.getUTCFullYear(),
    fromDate.getUTCMonth(),
    fromDate.getUTCDate(),
    fromDate.getUTCHours(),
    fromDate.getUTCMinutes(),
    fromDate.getUTCSeconds(),
    fromDate.getUTCMilliseconds(),
  )
}

/**
 * If you parsed a date string that didn't include a time zone, adjust the
 * local date components into a UTC Date with the same Y/M/D/H/M/S values.
 */
export function datetimeToUTC(fromDate: Date): Date {
  return new Date(Date.UTC(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate(),
    fromDate.getHours(),
    fromDate.getMinutes(),
    fromDate.getSeconds(),
    fromDate.getMilliseconds(),
  ))
}

// const tsMs2000 = 946684800000   // same as Jan 11 1970 in ms
// const tsMs2500 = 16725225600000 // same as Jul 13 1970 in ms
//               1000000000000

/**
 * Convert a timestamp in milliseconds to seconds.
 *
 * When `smart` is true the function will try to detect already-second
 * timestamps and return them unchanged (heuristic threshold). For example,
 * small numbers (< 1e12) are likely seconds and are returned as-is.
 *
 * @param ts - timestamp in milliseconds or seconds
 * @param smart - enable heuristic detection (default: true)
 * @returns timestamp in seconds
 */
export function timestampMillisecondsToSeconds(ts: number, smart = true): number {
  if (ts <= 0)
    return 0
  if (smart && ts < 1000000000000) { // TODO find a better threshold and add tests
    return ts
    // log.warn('Timestamp might already be in seconds?', ts)
  }
  return Math.floor(ts / 1000)
}

/**
 * Convert a timestamp in seconds to milliseconds.
 *
 * When `smart` is true the function tries to detect already-millisecond
 * values and returns them unchanged (heuristic threshold). Very large
 * numbers (> 1e12) are assumed to already be milliseconds.
 *
 * @param ts - timestamp in seconds or milliseconds
 * @param smart - enable heuristic detection (default: true)
 * @returns timestamp in milliseconds
 */
export function timestampSecondsToMilliseconds(ts: number, smart = true): number {
  if (ts <= 0)
    return 0
  if (smart && ts > 1000000000000) { // TODO find a better threshold and add tests
    return ts
    // log.warn('Timestamp might already be in milliseconds?', ts)
  }
  return Math.floor(ts * 1000)
}

/** Number of milliseconds in (approx.) one year (365 days). */
export const TIME_YEAR_MS = 31536000000 // 365 * 24 * 60 * 60 * 1000
/** Number of seconds in (approx.) one year (365 days). */
export const TIME_YEAR_S = 31536000 // 365 * 24 * 60 * 60
/** Number of milliseconds in (approx.) one month (30 days). */
export const TIME_MONTH_MS = 2592000000 // 30 * 24 * 60 * 60 * 1000
/** Number of seconds in (approx.) one month (30 days). */
export const TIME_MONTH_S = 2592000 // 30 * 24 * 60 * 60
/** Number of milliseconds in one week (7 days). */
export const TIME_WEEK_MS = 604800000 // 7 * 24 * 60 * 60 * 1000
/** Number of seconds in one week (7 days). */
export const TIME_WEEK_S = 604800 // 7 * 24 * 60 * 60
/** Number of milliseconds in one day (24 hours). */
export const TIME_DAY_MS = 86400000 // 24 * 60 * 60 * 1000
/** Number of seconds in one day (24 hours). */
export const TIME_DAY_S = 86400 // 24 * 60 * 60
/** Number of milliseconds in one hour (60 minutes). */
export const TIME_HOUR_MS = 3600000 // 60 * 60 * 1000
/** Number of seconds in one hour (60 minutes). */
export const TIME_HOUR_S = 3600 // 60 * 60
/** Number of milliseconds in one minute (60 seconds). */
export const TIME_MINUTE_MS = 60000 // 60 * 1000
/** Number of seconds in one minute (60 seconds). */
export const TIME_MINUTE_S = 60 // 60

// BUILD NUMBER

const buildNumberSeconds = 5
const buildNumberPadding = 6
const buildStartSeconds = 1735686000 // 2025-01-01

/** Build number is minutes since 2025-01-01 in base32 "agnoster" encoded format */
export function getBuildNumber(): string {
  const buildNumber = Math.floor((getTimestampInSeconds() - buildStartSeconds) / buildNumberSeconds)
  return numberToBase32(buildNumber, buildNumberPadding)
}

export function getSecondsFromBuildNumber(buildNumber: string): number {
  return buildStartSeconds + (base32ToNumber(buildNumber) * buildNumberSeconds)
}
