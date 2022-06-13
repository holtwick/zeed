import { linkifyPlainText, toHumanReadableUrl } from "./url"

describe("url", () => {
  it("Split string to URLs", () => {
    const sample =
      "https://example.com has <strange & fancy> some example.com at end http://example.com some"
    expect(linkifyPlainText(sample)).toBe(
      '<a target="_blank" href="https://example.com">example.com</a> has &lt;strange &amp; fancy&gt; some example.com at end <a target="_blank" href="http://example.com">example.com</a> some'
    )
  })

  it("should make human readable url", () => {
    expect(toHumanReadableUrl("example.com")).toEqual("example.com")
    expect(toHumanReadableUrl("https://www.receipts-app.com/")).toEqual(
      "receipts-app.com"
    )
    expect(toHumanReadableUrl("https://pdfify.app/")).toEqual("pdfify.app")
    expect(
      toHumanReadableUrl("https://pdfify.app/more/subpage.html?query=123")
    ).toEqual("pdfify.app/more/subpage.html?query=123")
  })
})
