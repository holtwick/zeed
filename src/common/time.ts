// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

/**
 * @returns Timestamp in miliseconds
 */
export const getTimestamp = (): number => Date.now()
// @ts-ignore
// typeof performance !== "undefined" ? performance.now() : new Date().getTime()

export function formatMilliseconds(ms: number): string {
  return ms > 999 ? (ms / 1000).toFixed(1) + "s" : ms.toFixed(2) + "ms"
}

export function parseDate(
  ...dateCandidates: (string | Date)[]
): Date | undefined {
  for (let dateCandidate of dateCandidates) {
    if (dateCandidate instanceof Date) {
      return dateCandidate
    }
    if (typeof dateCandidate === "string") {
      let date = null
      if (dateCandidate.includes(":")) {
        try {
          date = new Date(dateCandidate)
        } catch (err) {}
      }
      if (!(date instanceof Date)) {
        let m = /(\d\d\d\d)-(\d\d)-(\d\d)/.exec(dateCandidate)
        if (m) {
          date = new Date(+m[1], +m[2] - 1, +m[3], 12, 0)
        }
      }
      if (date instanceof Date) {
        return date
      }
    }
  }
}
