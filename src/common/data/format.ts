/** Just a simple yet fast helper. Alternatively you may use Intl formatters http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat */
export function formatBytesToHumanBase1024(bytes: number, decimals = 2) {
  // https://en.wikipedia.org/wiki/Orders_of_magnitude_(data)
  const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'] // etc
  const c = 1 / 1023 // change it to 1024 and see the diff
  let i = 0
  let h = 0
  if (bytes < 0)
    bytes = 0
  for (; h < c && i < units.length; i++) {
    h = 1024 ** i / bytes
    if (h >= c)
      break
  }
  return (`${(1 / h).toFixed(i > 0 ? decimals : 0).toLocaleString()} ${units[i]}`)
}

export const formatBytesToHuman = formatBytesToHumanBase1024

/** Just a simple yet fast helper. Alternatively you may use Intl formatters http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat */
export function formatBytesToHumanBase1000(bytes: number, decimals = 2) {
  // https://en.wikipedia.org/wiki/Orders_of_magnitude_(data)
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'] // etc
  const c = 1 / 999
  let i = 0
  let h = 0
  if (bytes < 0)
    bytes = 0
  for (; h < c && i < units.length; i++) {
    h = 1000 ** i / bytes
    if (h >= c)
      break
  }
  return (`${(1 / h).toFixed(i > 0 ? decimals : 0).toLocaleString()} ${units[i]}`)
}

/** Just a simple yet fast helper. Alternatively you may use Intl formatters http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat */
export function formatSecondsToTime(seconds: number, separator = ':') {
  const prefix = seconds < 0 ? '-' : ''
  if (seconds < 0)
    seconds = -1 * seconds
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.round(seconds % 60)
  return prefix + [h, m > 9 ? m : h ? `0${m}` : m || '0', s > 9 ? s : `0${s}`].filter(Boolean).join(separator)
}
