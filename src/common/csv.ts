// See https://github.com/jczaplew/csv-express/blob/master/lib/csv-express.js

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

export function csvStringify(data: any[], opt: {
  header?: string[]
  separator?: string
} = {}): string {
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

export function csvParse(s: string, opt: {
  separator?: string
} = {}) {
  const { separator = _separator } = opt

  // console.log('lines', s)
  const valuesRegExp = /("((?:(?:[^"]*?)(?:"")?)*)"|([^,;\t]*))([,;\t]|\n)/g

  function parseLine(line: string) {
    // const element: any = {}
    const values = []
    let matches: any
    // valuesRegExp.index = 0
    // eslint-disable-next-line no-cond-assign
    while ((matches = valuesRegExp.exec(`${line}\n`))) {
      console.log(matches)
      const value = matches[2] ?? matches[3] ?? ''
      // value = value.replace(/\"\"/g, '"')
      values.push(value)
    }
    return values
  }

  // const headers = parseLine(lines.splice(0, 1)[0])

  const lines = s.split(/(?:\r\n|\n)+/).filter(el => el.trim().length !== 0)
  const result = lines.map(parseLine)
  console.log('result', result)
  return result
}
