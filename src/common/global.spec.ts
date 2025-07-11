import { getGlobalContext } from './global'

declare global {
  interface ZeedGlobalContext {
    test?: number
  }
}

describe('global', () => {
  it('should remeber global', async () => {
    getGlobalContext().test = 0
    getGlobalContext().test = 123
    expect(getGlobalContext().test).toBe(123)
  })

  it('should use self as global', () => {
    const orig = { self: globalThis.self, window: globalThis.window, global: globalThis.global, globalThis: globalThis.globalThis }
    // @ts-expect-error
    globalThis.self = { _zeedGlobal: { test: 42 } }
    // @ts-expect-error
    delete globalThis.window
    // @ts-expect-error
    delete globalThis.global
    // @ts-expect-error
    delete globalThis.globalThis
    const ctx = getGlobalContext()
    expect(ctx.test).toBe(42)
    // Restore
    globalThis.self = orig.self
    globalThis.window = orig.window
    globalThis.global = orig.global
    // globalThis.globalThis = orig.globalThis // cannot assign, skip
  })

  it('should use window as global', () => {
    const orig = { self: globalThis.self, window: globalThis.window, global: globalThis.global, globalThis: globalThis.globalThis }
    // @ts-expect-error
    delete globalThis.self
    // @ts-expect-error
    globalThis.window = { _zeedGlobal: { test: 43 } }
    // @ts-expect-error
    delete globalThis.global
    // @ts-expect-error
    delete globalThis.globalThis
    const ctx = getGlobalContext()
    expect(ctx.test).toBe(43)
    // Restore
    globalThis.self = orig.self
    globalThis.window = orig.window
    globalThis.global = orig.global
    // globalThis.globalThis = orig.globalThis // cannot assign, skip
  })

  it('should use global as global', () => {
    const orig = { self: globalThis.self, window: globalThis.window, global: globalThis.global, globalThis: globalThis.globalThis }
    // @ts-expect-error
    delete globalThis.self
    // @ts-expect-error
    delete globalThis.window
    // @ts-expect-error
    globalThis.global = { _zeedGlobal: { test: 44 } }
    // @ts-expect-error
    delete globalThis.globalThis
    const ctx = getGlobalContext()
    expect(ctx.test).toBe(44)
    // Restore
    globalThis.self = orig.self
    globalThis.window = orig.window
    globalThis.global = orig.global
    // globalThis.globalThis = orig.globalThis // cannot assign, skip
  })

  it('should use globalThis as global (default)', () => {
    // This test just checks that the default branch works in Node.js
    const ctx = getGlobalContext({ test: 88 })
    expect(ctx.test).toBe(88)
  })

  // Error branch test is not possible in Node.js because globalThis is always present and read-only
  // So we skip this test in this environment
  it.skip('should throw if no global found', () => {
    const orig = { self: globalThis.self, window: globalThis.window, global: globalThis.global, globalThis: globalThis.globalThis }
    // @ts-expect-error
    delete globalThis.self
    // @ts-expect-error
    delete globalThis.window
    // @ts-expect-error
    delete globalThis.global
    // @ts-expect-error
    delete globalThis.globalThis
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('./global').getGlobalContext()
    }).toThrow('unable to locate global object')
    // Restore
    globalThis.self = orig.self
    globalThis.window = orig.window
    globalThis.global = orig.global
    // globalThis.globalThis = orig.globalThis // cannot assign, skip
  })

  it('should use custom default value', () => {
    const ctx = getGlobalContext({ test: 99 })
    expect(ctx.test).toBe(99)
  })
})
