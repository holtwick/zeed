// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { isLocalHost } from "./localhost"

describe("Localhost", () => {
  it("should be accurate", () => {
    const samples = {
      "1.1.1.1": false,
      "127.0.0.1": true,
      "10.0.0.99": true,
      "192.168.0.99": true,
      "space.local": true,
      "holtwick.de": false,
      somename: false,
      local: false,
      localhost: true,
      "::1": true,
    }
    for (let [domain, result] of Object.entries(samples)) {
      // console.log(domain, result)
      expect(isLocalHost(domain)).toBe(result)
    }
  })
})
