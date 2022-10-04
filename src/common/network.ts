import {
  arrayFlatten,
  deepMerge,
  isArray,
  jsonStringifySafe,
  toBase64,
} from './data'
import { encodeQuery } from './data/url'
import { Logger } from './log'
import type { Json } from './types'

const log = Logger('zeed:network')

interface fetchOptionType {
  /** Returns the cache mode associated with request, which is a string indicating how the request will interact with the browser's cache when fetching. */
  cache?: RequestCache
  /** Returns the credentials mode associated with request, which is a string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. */
  credentials?: RequestCredentials
  /** Returns the kind of resource requested by request, e.g., "document" or "script". */
  destination?: RequestDestination
  /** Returns a Headers object consisting of the headers associated with request. Note that headers added in the network layer by the user agent will not be accounted for in this object, e.g., the "Host" header. */
  headers?: Record<string, string>
  /** Returns request's subresource integrity metadata, which is a cryptographic hash of the resource being fetched. Its value consists of multiple hashes separated by whitespace. [SRI] */
  integrity?: string
  /** Returns a boolean indicating whether or not request can outlive the global in which it was created. */
  keepalive?: boolean
  /** Returns request's HTTP method, which is "GET" by default. */
  method?: string
  /** Returns the mode associated with request, which is a string indicating whether the request will use CORS, or will be restricted to same-origin URLs. */
  mode?: RequestMode
  /** Returns the redirect mode associated with request, which is a string indicating how redirects for the request will be handled during fetching. A request will follow redirects by default. */
  redirect?: RequestRedirect
  /** Returns the referrer of request. Its value can be a same-origin URL if explicitly set in init, the empty string to indicate no referrer, and "about:client" when defaulting to the global's default. This is used during fetching to determine the value of the `Referer` header of the request being made. */
  referrer?: string
  /** Returns the referrer policy associated with request. This is used during fetching to compute the value of the request's referrer. */
  referrerPolicy?: ReferrerPolicy
  /** Returns the signal associated with request, which is an AbortSignal object indicating whether or not request has been aborted, and its abort event handler. */
  signal?: AbortSignal
  /** Returns the URL of request as a string. */
  url?: string
  body?: any
}

type fetchOptionsType = fetchOptionType | fetchOptionsType[]

const defaultOptions: fetchOptionType = {
  cache: 'no-cache',
  redirect: 'follow',
  headers: {},
}

// Source https://developer.mozilla.org/de/docs/Web/HTTP/Methods
export type httpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'HEAD'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'
  | 'PATCH'

export function parseBasicAuth(url: string) {
  const m = /:\/\/([^@]*)@/gi.exec(url)
  if (m && m[1]) {
    const [username, password] = m[1].split(':', 2)
    return {
      url: url.replace(`${m[1]}@`, ''),
      username,
      password,
    }
  }
}

/** Simplified `fetch` that returns `undefined` on non 200 status */
export async function fetchBasic(
  url: string | URL,
  fetchOptions: fetchOptionsType = {},
  fetchFn: (input: RequestInfo, init?: RequestInit) => Promise<Response> = fetch,
): Promise<Response | undefined> {
  try {
    if (isArray(fetchOptions))
      fetchOptions = deepMerge({}, ...arrayFlatten(fetchOptions))

    const auth = parseBasicAuth(String(url))
    if (auth) {
      url = auth.url
      fetchOptions = deepMerge(
        {},
        fetchOptions,
        fetchOptionsBasicAuth(auth.username, auth.password),
      )
    }

    if (
      // @ts-expect-error headers
      fetchOptions.headers != null
      // @ts-expect-error headers
      && !(fetchOptions.headers instanceof Headers)
    ) {
      // @ts-expect-error headers
      fetchOptions.headers = new Headers(fetchOptions.headers)
    }

    // log("fetch", url, fetchOptions)
    const response = await fetchFn(String(url), fetchOptions as RequestInit)

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    if (response.status < 400)
      return response

    try {
      log.warn(
        `Fetch of ${url} with ${fetchOptions} returned status=${response.status}`,
      )
      log.warn(`Response: ${await response.text()}`)
    }
    catch (err) {
      log.error('Exception:', err)
    }
  }
  catch (err) {
    log.error('fetchBasic', err)
  }
}

/** Fetch for JSON  */
export async function fetchJson<T = Json>(
  url: string | URL,
  fetchOptions: fetchOptionsType = {},
  fetchFn: (input: RequestInfo, init?: RequestInit) => Promise<Response> = fetch,
): Promise<T | undefined> {
  try {
    const res = await fetchBasic(
      url,
      [
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        },
        fetchOptions,
      ],
      fetchFn,
    )
    if (res)
      return await res.json()
  }
  catch (err) {
    log.error('fetchJSON error:', err)
  }
}

/** Fetch for text */
export async function fetchText(
  url: string | URL,
  fetchOptions: fetchOptionsType = {},
  fetchFn: (input: RequestInfo, init?: RequestInit) => Promise<Response> = fetch,
): Promise<string | undefined> {
  try {
    const res = await fetchBasic(
      url,
      [defaultOptions, { method: 'GET' }, fetchOptions],
      fetchFn,
    )
    if (res)
      return await res.text()
  }
  catch (err) {
    log.error('fetchHTML error:', err)
  }
}

///

/** Options for fetchBasic to send data as application/x-www-form-urlencoded */
export function fetchOptionsFormURLEncoded(
  data: object,
  method: httpMethod = 'POST',
): fetchOptionType {
  return {
    method,
    ...defaultOptions,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    },
    body: encodeQuery(data),
  }
}

/** Options to send data as JSON  */
export function fetchOptionsJson(
  data: object,
  method: httpMethod = 'POST',
): fetchOptionType {
  return {
    method,
    ...defaultOptions,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Accept: "application/json",
    },
    body: jsonStringifySafe(data),
  }
}

/** Options to pass basic auth */
export function fetchOptionsBasicAuth(
  username: string,
  password: string,
): fetchOptionType {
  return {
    headers: {
      Authorization: `Basic ${toBase64(`${username}:${password}`)}`,
    },
  }
}
