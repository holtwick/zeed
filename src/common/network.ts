import { Json } from "./types"
import { Logger } from "./log"
import { encodeQuery } from "./data/url"

const log = Logger("network")

const defaultOptions = {
  cache: "no-cache",
  redirect: "follow",
}

// Source https://developer.mozilla.org/de/docs/Web/HTTP/Methods
export type httpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "HEAD"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "PATCH"

export async function fetchBasic(
  url: string,
  fetchOptions: any = {},
  fetchFn: (input: RequestInfo, init?: RequestInit) => Promise<Response> = fetch
): Promise<Response | undefined> {
  try {
    // if (fetchOptions.headers != null && !(fetchOptions.headers instanceof Headers)) {
    //   fetchOptions.headers = new Headers(fetchOptions.headers)
    // }
    // log.log('fetch', url, fetchOptions)
    const response = await fetchFn(url, fetchOptions)

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    if (response.status < 400) {
      return response
    }
    try {
      log.warn(
        `Fetch of ${url} with ${fetchOptions} returned status=${response.status}`
      )
      log.warn(`Response: ${await response.text()}`)
    } catch (err) {
      log.error("Exception:", err)
    }
  } catch (err) {
    log.error("fetchBasic", err)
  }
}

export async function fetchJson<T = Json>(
  url: string,
  opts: any = {},
  fetchFn: (input: RequestInfo, init?: RequestInit) => Promise<Response> = fetch
): Promise<T | undefined> {
  try {
    let res = await fetchBasic(
      url,
      {
        method: "GET",
        ...defaultOptions,
        headers: {},
        ...opts,
      },
      fetchFn
    )
    if (res) {
      return await res.json()
    }
  } catch (err) {
    log.error("fetchJSON error:", err)
  }
}

export function fetchOptionsFormURLEncoded(
  data: Object,
  method: httpMethod = "POST"
) {
  return {
    method,
    ...defaultOptions,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    body: encodeQuery(data),
  }
}

export function fetchOptionsJson(data: Object, method: httpMethod = "POST") {
  return {
    method,
    ...defaultOptions,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  }
}

export async function fetchText(
  url: string,
  opts: any = {},
  fetchFn: (input: RequestInfo, init?: RequestInit) => Promise<Response> = fetch
): Promise<string | undefined> {
  try {
    let res = await fetchBasic(
      url,
      {
        method: "GET",
        ...defaultOptions,
        headers: {},
        ...opts,
      },
      fetchFn
    )
    if (res) {
      return await res.text()
    }
  } catch (err) {
    log.error("fetchHTML error:", err)
  }
}
