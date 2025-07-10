let testModeTime: number | undefined

export function setTimestampTest(ts = Date.UTC(2000, 0, 1, 0, 0, 0, 0)) {
  testModeTime = ts
}

/**
 * @returns Timestamp in miliseconds
 */
export function getTimestamp(): number {
  return testModeTime ?? Date.now()
}

/**
 * @returns Timestamp in seconds
 */
export function getTimestampInSeconds(): number {
  return Math.floor(getTimestamp() / 1000)
}

/**
 * @returns Timestamp in seconds
 */
export function dateFromSeconds(ts: number): Date {
  return new Date(ts * 1000)
}

// typeof performance !== "undefined" ? performance.now() : new Date().getTime()

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
 * @returns Timestamp in miliseconds
 */
export function getPerformanceTimestamp(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

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

/** If you parsed a date without time zone, you may need to shift it to local time */
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

/** If you parsed a date without time zone, you may need to shift it to UTC time */
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

/** ms -> s with simple check. Assume low values are already ms */
export function timestampMillisecondsToSeconds(ts: number, smart = true): number {
  if (ts <= 0)
    return 0
  if (smart && ts < 1000000000000) { // TODO find a better threshold and add tests
    return ts
    // log.warn('Timestamp might already be in seconds?', ts)
  }
  return Math.floor(ts / 1000)
}

/** s -> ms with simple check. Assume high values are already ms */
export function timestampSecondsToMilliseconds(ts: number, smart = true): number {
  if (ts <= 0)
    return 0
  if (smart && ts > 1000000000000) { // TODO find a better threshold and add tests
    return ts
    // log.warn('Timestamp might already be in milliseconds?', ts)
  }
  return Math.floor(ts * 1000)
}

export const TIME_YEAR_MS = 31536000000 // 365 * 24 * 60 * 60 * 1000
export const TIME_YEAR_S = 31536000 // 365 * 24 * 60 * 60
export const TIME_MONTH_MS = 2592000000 // 30 * 24 * 60 * 60 * 1000
export const TIME_MONTH_S = 2592000 // 30 * 24 * 60 * 60
export const TIME_WEEK_MS = 604800000 // 7 * 24 * 60 * 60 * 1000
export const TIME_WEEK_S = 604800 // 7 * 24 * 60 * 60
export const TIME_DAY_MS = 86400000 // 24 * 60 * 60 * 1000
export const TIME_DAY_S = 86400 // 24 * 60 * 60
export const TIME_HOUR_MS = 3600000 // 60 * 60 * 1000
export const TIME_HOUR_S = 3600 // 60 * 60
export const TIME_MINUTE_MS = 60000 // 60 * 1000
export const TIME_MINUTE_S = 60 // 60
