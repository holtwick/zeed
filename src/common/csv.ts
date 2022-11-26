/*
  csv-express
  Forked and modified by John J Czaplewski <jczaplew@gmail.com>
  Copyright 2011 Seiya Konno <nulltask@gmail.com>
  MIT Licensed

  https://github.com/jczaplew/csv-express/blob/master/lib/csv-express.js
 */

import { isArray, isBoolean, isRecord, jsonStringifySafe } from './data'

// Configurable settings
const _separator = ','

// Stricter parseFloat to support hexadecimal strings from
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/parseFloat#A_stricter_parse_function
function filterFloat(value: string) {
  if (/^([-+])?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value))
    return Number(value)
  return NaN
}

function escape(field: any) {
  if (field == null)
    return ''
  if (isBoolean(field))
    return field ? 1 : 0
  if (!isNaN(filterFloat(field)) && isFinite(field))
    return parseFloat(field)
  if (isRecord(field) || isArray(field))
    return jsonStringifySafe(field)
  return `"${String(field).replace(/"/g, '""')}"`
}

export function csv(data: any[], opt: {
  header?: string[]
  separator?: string
}): string {
  const { separator = _separator, header } = opt
  let body = ''

  // Append the header row to the response if requested
  if (header)
    body = `${header.join(separator)}\r\n`

  // Convert the data to a CSV-like structure
  for (let i = 0; i < data.length; i++)
    body += `${data[i].map(escape).join(separator)}\r\n`

  return body
}
