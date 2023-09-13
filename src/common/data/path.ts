// https://github.com/sindresorhus/filenamify/blob/main/filenamify.js
/* eslint-disable no-control-regex */

import { escapeRegExp } from './regexp'

const MAX_FILENAME_LENGTH = 100

// const reControlChars = /[\u0000-\u001F\u0080-\u009F]/g
const reRelativePath = /^\.+/
const reTrailingPeriods = /\.+$/
const reFilenameIllegal = /[<>:\"/\\|?*\u0000-\u001F\u0080-\u009F]+/gm // https://superuser.com/questions/358855/what-characters-are-safe-in-cross-platform-file-names-for-linux-windows-and-os/358861#358861

function filenameReservedRegex() {
  return reFilenameIllegal // /[<>:"/\\|?*\u0000-\u001F]/g
}

function windowsReservedNameRegex() {
  return /^(con|prn|aux|nul|com\d|lpt\d)$/i
}

/**
 * Ensure a valid file name. Unsupported characters get a `replacement`, default: `_`
 * @param string
 * @param replacement
 */
export function toValidFilename(string: string, replacement = '_'): string | never {
  if (typeof string !== 'string')
    throw new TypeError('Expected a string')

  if (filenameReservedRegex().test(replacement))
    throw new Error('Replacement string cannot contain reserved filename characters')

  const reReplacement = `(${escapeRegExp(replacement)})+`

  string = string
    .replace(filenameReservedRegex(), replacement)
    .replace(reRelativePath, replacement)
    .replace(reTrailingPeriods, '')
    .replace(new RegExp(reReplacement, 'gm'), replacement) // collapse
    .trim()

  string = windowsReservedNameRegex().test(string) ? string + replacement : string

  return string.slice(0, MAX_FILENAME_LENGTH)
}
