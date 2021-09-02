import { linkifyPlainText } from "./url"

describe("url", () => {
  it("Split string to URLs", () => {
    const sample =
      "http://example.com has <strange & fancy> some example.com at end http://example.com some"
    console.log(linkifyPlainText(sample))
  })
})
