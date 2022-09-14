// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { platform } from "./platform"

describe("Platform", () => {
  it("should detect", () => {
    if (globalThis.isNodeTestEnv) {
      expect(platform.node).toBe(true)
      expect(platform.test).toBe(true)
      expect(platform.browser).toBe(false)

      let isBrowser = new Function(
        "try {return this===window;}catch(e){ return false;}"
      )
      expect(isBrowser()).toBe(false)
    } else {
      expect(platform.node).toBe(false)
      expect(platform.test).toBe(false)
      expect(platform.browser).toBe(true)

      let isBrowser = new Function(
        "try {return this===window;}catch(e){ return false;}"
      )
      expect(isBrowser()).toBe(true)
    }
  })
})
