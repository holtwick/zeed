import { Logger } from "./log"
import { fetchText } from "./network"
import "cross-fetch/polyfill"

const log = Logger("network")

describe("network", () => {
  it("should fetch", async () => {
    let html = await fetchText("https://holtwick.de")
    expect(html).toContain("<html")
  })
})
