import "cross-fetch/polyfill"
import { Logger } from "./log"
import { fetchText } from "./network"

const log = Logger("network")

describe("network", () => {
  it("should fetch", async () => {
    let html = await fetchText("https://holtwick.de")
    expect(html).toContain("<html")
    // fetchJson<string[]>('')
  })
})
