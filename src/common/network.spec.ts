import "cross-fetch/polyfill"
import { Logger } from "./log"
import {
  fetchJson,
  fetchOptionsJson,
  fetchText,
  parseBasicAuth,
} from "./network"

const log = Logger("network")

describe("network", () => {
  it("should fetch", async () => {
    let html = await fetchText("https://holtwick.de")
    expect(html).toContain("<html")
    // fetchJson<string[]>('')
  })

  it("should parse basic auth", () => {
    let url = "https://user:pass@example.com/?x=1"
    expect(parseBasicAuth(url)).toMatchInlineSnapshot(`
      {
        "password": "pass",
        "url": "https://example.com/?x=1",
        "username": "user",
      }
    `)
  })

  it("should do a test call", async () => {
    let text = await fetchJson(
      "https://user:123@httpbin.org/basic-auth/user/123"
    )
    expect(text).toMatchInlineSnapshot(`
      {
        "authenticated": true,
        "user": "user",
      }
    `)

    let post = await fetchJson(
      "https://httpbin.org/post",
      fetchOptionsJson({ a: 1 }, "POST")
    )

    // @ts-ignore
    expect(post?.data).toMatchInlineSnapshot('"{\\"a\\":1}"')
  })
})
