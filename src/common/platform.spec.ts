import { platform } from "./platform"

describe("Platform", () => {
  it("should detect", () => {
    expect(platform.node).toBe(true)
    expect(platform.jest).toBe(true)
    expect(platform.browser).toBe(false)
  })
})
