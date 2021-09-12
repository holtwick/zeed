import { linkifyPlainText } from "./url"

describe("url", () => {
  it("Split string to URLs", () => {
    const sample =
      "http://example.com has <strange & fancy> some example.com at end http://example.com some"
    expect(linkifyPlainText(sample)).toBe(
      '<a target="_blank" href="http://example.com">http://example.com</a> has &lt;strange &amp; fancy&gt; some example.com at end <a target="_blank" href="http://example.com">http://example.com</a> some'
    )
  })
})
