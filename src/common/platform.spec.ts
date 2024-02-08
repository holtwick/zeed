// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

/* eslint-disable no-new-func */

import { detect } from './platform'

describe('platform', () => {
  it('should detect', () => {
    const platform = detect()

    if (globalThis.isNodeTestEnv) {
      expect(platform.node).toBe(true)
      expect(platform.test).toBe(true)
      expect(platform.browser).toBe(false)

      // eslint-disable-next-line ts/no-implied-eval
      const isBrowser = new Function('try {return this===window;}catch(e){ return false;}')
      expect(isBrowser()).toBe(false)
    }
    else {
      expect(platform.node).toBe(false)
      expect(platform.test).toBe(false)
      expect(platform.browser).toBe(true)

      // eslint-disable-next-line ts/no-implied-eval
      const isBrowser = new Function('try {return this===window;}catch(e){ return false;}')
      expect(isBrowser()).toBe(true)
    }
  })
})
