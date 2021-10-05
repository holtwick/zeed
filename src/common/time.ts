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
