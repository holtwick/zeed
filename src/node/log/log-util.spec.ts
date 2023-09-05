// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { getSourceLocation, getStackLlocationList } from './log-util'

describe('log-util', () => {
  test('should find correct source file line', () => {
    const source = getSourceLocation(1, true)
    expect(source.startsWith('src/node/log/log-util.spec.ts:')).toBe(true)
  })

  test('should parse stack', () => {
    const sample = `
    at getSourceLocation (file:///Users/dirk/work/public/zeed/dist/esm/node/log-util.js:13:17)
    at file:///Users/dirk/work/public/zeed/dist/esm/node/log-node.js:105:26
    at /Users/dirk/work/public/zeed/dist/esm/node/log-node.js:105:26
    at emit (file:///Users/dirk/work/public/zeed/dist/esm/common/log.js:32:33)
    at Function.LoggerBaseFactory.log.info (file:///Users/dirk/work/public/zeed/dist/esm/common/log.js:55:13)
    at file:///Users/dirk/work/public/zeed/demos/logging/index.js:37:5
    at ModuleJob.run (node:internal/modules/esm/module_job:183:25)
    at async Loader.import (node:internal/modules/esm/loader:178:24)
    at async Object.loadESM (node:internal/process/esm_loader:68:5)
    at async handleMainPromise (node:internal/modules/run_main:63:12)
`
    expect(getStackLlocationList(sample)).toEqual([
      '/Users/dirk/work/public/zeed/dist/esm/node/log-util.js:13:17',
      '/Users/dirk/work/public/zeed/dist/esm/node/log-node.js:105:26',
      '/Users/dirk/work/public/zeed/dist/esm/node/log-node.js:105:26',
      '/Users/dirk/work/public/zeed/dist/esm/common/log.js:32:33',
      '/Users/dirk/work/public/zeed/dist/esm/common/log.js:55:13',
      '/Users/dirk/work/public/zeed/demos/logging/index.js:37:5',
      'node:internal/modules/esm/module_job:183:25',
      'node:internal/modules/esm/loader:178:24',
      'node:internal/process/esm_loader:68:5',
      'node:internal/modules/run_main:63:12',
    ])
  })
})
