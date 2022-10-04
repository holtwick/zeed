// https://github.com/sindresorhus/filenamify/blob/main/filenamify.js

/* eslint-disable no-control-regex */

const MAX_FILENAME_LENGTH = 100

const reControlChars = /[\u0000-\u001F\u0080-\u009F]/g
const reRelativePath = /^\.+/
const reTrailingPeriods = /\.+$/

function filenameReservedRegex() {
  return /[<>:"/\\|?*\u0000-\u001F]/g
}

function windowsReservedNameRegex() {
  return /^(con|prn|aux|nul|com\d|lpt\d)$/i
}

/** Ensure a valid file name. Unsupported characters get a `replacement`, default: `_` */
export function toValidFilename(
  string: string,
  replacement = '_',
): string | never {
  if (typeof string !== 'string')
    throw new TypeError('Expected a string')

  if (
    filenameReservedRegex().test(replacement)
    && reControlChars.test(replacement)
  ) {
    throw new Error(
      'Replacement string cannot contain reserved filename characters',
    )
  }

  string = string
    .replace(filenameReservedRegex(), replacement)
    .replace(reControlChars, replacement)
    .replace(reRelativePath, replacement)
    .replace(reTrailingPeriods, '')

  string = windowsReservedNameRegex().test(string)
    ? string + replacement
    : string

  return string.slice(0, MAX_FILENAME_LENGTH)
}
