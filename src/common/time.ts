/**
 * @returns Timestamp in miliseconds
 */
export function getTimestamp(): number {
  return Date.now()
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
