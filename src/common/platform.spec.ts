// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { platform } from "./platform"

describe("Platform", () => {
  it("should detect", () => {
    expect(platform.node).toBe(true)
    expect(platform.jest).toBe(true)
    expect(platform.browser).toBe(false)

    let isBrowser = new Function(
      "try {return this===window;}catch(e){ return false;}"
    )
    expect(isBrowser()).toBe(false)
  })
})
