import { isArray, isBoolean, isRecord, jsonStringifySafe } from './data'

const defaultSeparator = ','

export function csvStringify(data: any[], opt: {
  // header?: string[]
  separator?: string
} = {}): string {
  const { separator = defaultSeparator } = opt
  let body = ''

  // Append the header row to the response if requested
  // if (header)
  //   body = `${header.join(separator)}\n`

  // Convert the data to a CSV-like structure
  for (let i = 0; i < data.length; i++) {
    body += `${data[i].map((field: string) => {
      if (field == null || field === '')
        return ''
      if (isBoolean(field))
        return field ? 1 : 0
      let s = String(field)
      if (isRecord(field) || isArray(field))
        s = jsonStringifySafe(field)
      if (s.includes('"') || s.includes('\n') || s.includes(separator))
        return `"${s.replace(/"/g, '""')}"`
      return s
    }).join(separator)}\n`
  }

  return body
}

export function csvParse(s: string, opt: {
  separator?: string
} = {}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { separator = defaultSeparator } = opt

  // console.log('lines', s)
  const valuesRegExp = /("((?:(?:[^"]*?)(?:"")?)*)"|([^,;\t]*))([,;\t]|\n)/g

  function parseLine(line: string) {
    // const element: any = {}
    const values = []
    let matches: any
    // valuesRegExp.index = 0
    // eslint-disable-next-line no-cond-assign
    while ((matches = valuesRegExp.exec(`${line}\n`))) {
      // console.log(matches)
      let value = matches[2] ?? matches[3] ?? ''
      value = value.replace(/\"\"/g, '"')
      values.push(value)
    }
    return values
  }

  // const headers = parseLine(lines.splice(0, 1)[0])

  const lines = s.split(/(?:\r\n|\n)+/).filter(el => el.trim().length !== 0)
  const result = lines.map(parseLine)
  // console.log('result', result)
  return result
}
