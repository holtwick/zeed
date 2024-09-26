/**
 * @returns Timestamp in miliseconds
 */
export function getTimestamp(): number {
  return Date.now()
}

/**
 * @returns Timestamp in seconds
 */
export function getTimestampInSeconds(): number {
  return Math.floor(Date.now() / 1000)
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

export function duration() {
  const t0 = getPerformanceTimestamp()

  return function () {
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

/** ms -> s with simple check */
export function timestampMillisecondsToSeconds(ts: number) {
  if (ts <= 0)
    return 0
  if (ts < 1000000000000) {
    return ts
    // log.warn('Timestamp might already be in seconds?', ts)
  }
  return Math.floor(ts / 1000)
}

/** s -> ms with simple check */
export function timestampSecondsToMilliseconds(ts: number) {
  if (ts <= 0)
    return 0
  if (ts > 1000000000000) {
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
