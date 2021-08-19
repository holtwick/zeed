// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { getSourceLocation } from "./log-util"

describe("log-util", function () {
  test("should find correct source file line", function () {
    const source = getSourceLocation(0, true)
    expect(source).toBe("src/common/log-util.ts:13:15")
  })
})
