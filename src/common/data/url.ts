// https://mathiasbynens.be/demo/url-regex
// https://gist.github.com/dperini/729294

import { escapeHTML } from './html'

const findURL = /((?:(?:https?|ftp):)?\/\/(?:\S+@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4])|(?:(?:[a-z0-9\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[a-z0-9\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}\.?)(?::\d{2,5})?(?:[/?#]\S*)?)/gi

export function linkifyPlainText(text: string): string {
  return text
    .split(findURL)
    .map((part, i) => {
      const escapedPart = escapeHTML(part)
      return i % 2
        ? `<a target="_blank" href="${escapedPart}">${toHumanReadableUrl(
            escapedPart,
          )}</a>`
        : escapedPart
    })
    .join('')
}

export function toHumanReadableUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

//

export function encodeQuery(data: Record<string, any>, filterValue?: (value: any) => boolean) {
  const pairs = []
  for (let [key, value] of Object.entries(data)) {
    if (value != null) {
      if (!Array.isArray(value))
        value = [value]
      for (const v of value) {
        if (filterValue && !filterValue(v))
          continue
        else if (v == null)
          continue
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
      }
    }
  }
  return pairs.join('&')
}

export function parseQuery(queryString: string) {
  const query: any = {}
  const pairs = (
    queryString[0] === '?' ? queryString.substr(1) : queryString
  ).split('&')
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=')
    const key = decodeURIComponent(pair[0])
    const value = decodeURIComponent(pair[1] || '')
    if (query[key] != null) {
      if (!Array.isArray(query[key]))
        query[key] = [query[key]]

      query[key].push(value)
    }
    else {
      query[key] = value
    }
  }
  return query
}
