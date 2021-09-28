import { Json } from "./types"
import { Logger } from "./log"

const log = Logger("network")

// export const fetch = require("node-fetch")

export async function fetchBasic(
  url: string,
  fetchOptions: any = {}
): Promise<Response | undefined> {
  try {
    // if (fetchOptions.headers != null && !(fetchOptions.headers instanceof Headers)) {
    //   fetchOptions.headers = new Headers(fetchOptions.headers)
    // }
    // log.log('fetch', url, fetchOptions)
    const response = await fetch(url, fetchOptions)
    if (response.status === 200) {
      return response
    }
    try {
      log.warn(
        `Fetch of ${url} with ${fetchOptions} returned status ${response.status}`
      )
      log.warn(`Response: ${await response.text()}`)
    } catch (err) {
      log.error("Exception:", err)
    }
    if (response.status === 404) {
      log.error("fetchBasic: Unknown url", url)
    } else if (response.status >= 400 && response.status < 500) {
      log.error(
        `fetchBasic: Authentication error ${response.status} for ${url}`
      )
    } else {
      log.error(`Error loading data. Status ${response.status}: ${url}`)
    }
  } catch (err) {
    log.error("fetchBasic", err)
  }
}

export async function fetchJSON(
  url: string,
  opts: any = {}
): Promise<Json | undefined> {
  try {
    let res = await fetchBasic(url, {
      method: "GET",
      headers: {},
      ...opts,
    })
    if (res) {
      return await res.json()
    }
  } catch (err) {
    log.error("fetchJSON error:", err)
  }
}

export async function fetchText(
  url: string,
  opts: any = {}
): Promise<string | undefined> {
  try {
    let res = await fetchBasic(url, {
      method: "GET",
      headers: {},
      ...opts,
    })
    if (res) {
      return await res.text()
    }
  } catch (err) {
    log.error("fetchHTML error:", err)
  }
}
