/* eslint-disable no-new-func */

import { detect, getGlobal } from './platform'

describe('platform', () => {
  it('should detect', () => {
    const platform = detect()

    if (globalThis.isNodeTestEnv) {
      expect(platform.node).toBe(true)
      expect(platform.test).toBe(true)
      expect(platform.browser).toBe(false)

      const isBrowser = new Function('try {return this===window;}catch(e){ return false;}')
      expect(isBrowser()).toBe(false)
    }
    else {
      expect(platform.node).toBe(false)
      // expect(platform.test).toBe(false)
      expect(platform.browser).toBe(true)

      const isBrowser = new Function('try {return this===window;}catch(e){ return false;}')
      expect(isBrowser()).toBe(true)
    }
  })

  it('should return the global object', () => {
    const globalObject = getGlobal()

    if (globalThis.isNodeTestEnv)
      expect(globalObject).toBe(globalThis)
    else
      expect(globalObject).toBe(window)
  })
})
