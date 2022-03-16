// https://mathiasbynens.be/demo/url-regex
// https://gist.github.com/dperini/729294

import { escapeHTML } from "./html"

const findURL =
  /((?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?)/gim

export function linkifyPlainText(text: string): string {
  return text
    .split(findURL)
    .map((part, i) => {
      const escapedPart = escapeHTML(part)
      return i % 2
        ? `<a target="_blank" href="${escapedPart}">${toHumanReadableUrl(
            escapedPart
          )}</a>`
        : escapedPart
    })
    .join("")
}

export function toHumanReadableUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
}

//

export function encodeQuery(data: Record<string, any>) {
  let pairs = []
  for (let [key, value] of Object.entries(data)) {
    if (value != null) {
      if (!Array.isArray(value)) {
        value = [value]
      }
      for (let v of value) {
        if (v != null) {
          pairs.push(
            encodeURIComponent(key) + "=" + encodeURIComponent(String(v))
          )
        }
      }
    }
  }
  return pairs.join("&")
}

export function parseQuery(queryString: string) {
  let query: any = {}
  let pairs = (
    queryString[0] === "?" ? queryString.substr(1) : queryString
  ).split("&")
  for (let i = 0; i < pairs.length; i++) {
    let pair = pairs[i].split("=")
    let key = decodeURIComponent(pair[0])
    let value = decodeURIComponent(pair[1] || "")
    if (query[key] != null) {
      if (!Array.isArray(query[key])) {
        query[key] = [query[key]]
      }
      query[key].push(value)
    } else {
      query[key] = value
    }
  }
  return query
}
