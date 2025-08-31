/* eslint-disable no-restricted-globals */

/**
 * Global context for Zeed, used for cross-module state.
 * @category Global
 */

// Export the global context type so TypeDoc includes it in the docs.
export interface ZeedGlobalContext {
  [key: string]: any
}

declare global {
  interface ZeedGlobalContext {}
}

interface ZeedGlobalIntegration {
  _zeedGlobal?: ZeedGlobalContext
}

/** Identify the right global for the environment. Might be obsolete these days, due to globalThis. */
function _global(): ZeedGlobalIntegration {
  if (typeof self !== 'undefined')
    return self as ZeedGlobalIntegration
  if (typeof window !== 'undefined')
    return window as ZeedGlobalIntegration
  if (typeof global !== 'undefined')
    return global as ZeedGlobalIntegration
  if (typeof globalThis !== 'undefined')
    return globalThis as ZeedGlobalIntegration
  throw new Error('unable to locate global object')
}

/** Global object to work across module boundaries as well. Internally already used for logger and emitter. */
export function getGlobalContext<T = ZeedGlobalContext>(defaultValue = {}): T {
  const gcontext = _global()
  if (gcontext._zeedGlobal == null)
    gcontext._zeedGlobal = defaultValue
  return gcontext._zeedGlobal as T
}
