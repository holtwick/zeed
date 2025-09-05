// https://mathiasbynens.be/demo/url-regex
// https://gist.github.com/dperini/729294

import { escapeHTML } from './html'

/// Remove scheme, www. and trailing slash for display purposes
export function toHumanReadableUrl(url: string): string {
  return url.replace(/^(https?:\/\/(www\.)?|mailto:)/gi, '').replace(/\/$/, '')
}

//

export const RX_URL = /((?:(?:https?|ftp):)?\/\/(?:\S+@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4])|(?:(?:[a-z0-9\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[a-z0-9\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}\.?)(?::\d{2,5})?(?:[/?#]\S*)?)/gi

/** @deprecated use linkifyPlainText */
export function linkifyPlainTextSimple(text: string): string {
  return text
    .split(RX_URL)
    .map((part, i) => {
      const escapedPart = escapeHTML(part)
      return i % 2
        ? `<a target="_blank" rel="noopener noreferrer" href="${escapedPart}">${toHumanReadableUrl(
          escapedPart,
        )}</a>`
        : escapedPart
    })
    .join('')
}

// Advanced implementation that also handles email addresses and simple URLs without protocol

const RX_EMAIL = /((mailto:)?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
const RX_SIMPLE_URL = /([a-zA-Z0-9]+\.[a-zA-Z]{2,})/gi

function handleUrlString(part: string): string {
  var url = part
  var rests = []

  // Remove trailing punctuation from URLs
  const urlWithoutPunctuation = url.replace(/[.,!?;:]*$/, '')
  rests.unshift(url.slice(urlWithoutPunctuation.length))

  // Full URL with protocol
  if (url.includes('://')) {

    // Remove trailing closing brackets if unbalanced
    url = urlWithoutPunctuation
    const openingBrackets = (url.match(/[\(\[\{]/g) || []).length
    const closingBrackets = (url.match(/[\)\]\}]/g) || []).length
    if (closingBrackets > openingBrackets) {
      const diff = closingBrackets - openingBrackets
      const rx = new RegExp(`[\\)\\]\\}]{0,${diff}}$`, 'g')
      const urlWithoutTrailing = url.replace(rx, '')
      rests.unshift(url.slice(urlWithoutTrailing.length))
      url = urlWithoutTrailing
    }

  }

  // Email address
  else if (url.includes('@')) {
    if (!url.startsWith('mailto:'))
      url = `mailto:${urlWithoutPunctuation}`
  }

  // Simple URL without protocol
  else {
    url = `https://${urlWithoutPunctuation}`
  }

  const escapedRest = escapeHTML(rests.join(''))
  const escapedHumanReadableUrl = escapeHTML(toHumanReadableUrl(url))
  const escapedUrl = escapeHTML(url)
  const classInsecureHttp = url.startsWith('http://') ? ' class="_warn"' : ''
  return `<a target="_blank" rel="noopener noreferrer"${classInsecureHttp} href="${escapedUrl}">${escapedHumanReadableUrl}</a>${escapedRest}`
}

var rxJoined: RegExp | undefined = undefined

export interface LinkifyOptions {
}

export function linkifyPlainText(text: string, options: LinkifyOptions = {}): string {
  if (rxJoined == null) {
    rxJoined = new RegExp(`((${RX_URL.source})|(${RX_EMAIL.source})|(${RX_SIMPLE_URL.source}))`, 'gi')
  } else {
    rxJoined.lastIndex = 0
  }

  var index = 0
  const parts: string[] = []

  text.replace(rxJoined, (match, ...args) => {
    const offset = args[args.length - 2]
    const leading = text.slice(index, offset) ?? ''
    parts.push(escapeHTML(leading))
    index = offset + match.length
    parts.push(handleUrlString(match))
    return match
  })

  return parts.join('') + escapeHTML(text.slice(index))
}


export function linkifyPlainTextWithLineBreaks(text: string, options: LinkifyOptions = {}): string {
  return text.split('\n').map(l => linkifyPlainText(l, options)).join('<br>')
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
  while (queryString.startsWith('?')) {
    queryString = queryString.substring(1)
  }
  const pairs = queryString.split('&')
  for (let i = 0; i < pairs.length; i++) {
    const part = pairs[i]
    const idx = part.indexOf('=')
    if (part.length === 0) continue
    const key = idx < 0 ? part : decodeURIComponent(part.substring(0, idx))
    const value = idx < 0 ? '' : decodeURIComponent(part.substring(idx + 1))
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
