// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { getSourceLocation, getStackLlocationList } from "./log-util"

describe("log-util", function () {
  test("should find correct source file line", function () {
    const source = getSourceLocation(1, true)
    expect(source).toBe("src/common/log-util.spec.ts:7:20")
  })

  test("should parse stack", function () {
    const sample = `
    at getSourceLocation (file:///Users/dirk/work/public/zeed/dist/esm/common/log-util.js:13:17)
    at file:///Users/dirk/work/public/zeed/dist/esm/node/log-node.js:105:26
    at emit (file:///Users/dirk/work/public/zeed/dist/esm/common/log.js:32:33)
    at Function.LoggerBaseFactory.log.info (file:///Users/dirk/work/public/zeed/dist/esm/common/log.js:55:13)
    at file:///Users/dirk/work/public/zeed/demos/logging/index.js:37:5
    at ModuleJob.run (node:internal/modules/esm/module_job:183:25)
    at async Loader.import (node:internal/modules/esm/loader:178:24)
    at async Object.loadESM (node:internal/process/esm_loader:68:5)
    at async handleMainPromise (node:internal/modules/run_main:63:12)
`
    expect(getStackLlocationList(sample)).toMatchInlineSnapshot(`
Array [
  "file:///Users/dirk/work/public/zeed/dist/esm/common/log-util.js:13:17",
  "file:///Users/dirk/work/public/zeed/dist/esm/common/log.js:32:33",
  "file:///Users/dirk/work/public/zeed/dist/esm/common/log.js:55:13",
  "node:internal/modules/esm/module_job:183:25",
  "node:internal/modules/esm/loader:178:24",
  "node:internal/process/esm_loader:68:5",
  "node:internal/modules/run_main:63:12",
]
`)
  })
})
