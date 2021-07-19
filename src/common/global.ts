// Global context across build systems etc.

declare global {
  interface ZeedGlobalContext {}
}

interface ZeedGlobalIntegration {
  _zeedGlobal?: ZeedGlobalContext
}

function _global(): ZeedGlobalIntegration {
  if (typeof self !== "undefined") return self as ZeedGlobalIntegration
  if (typeof window !== "undefined") return window as ZeedGlobalIntegration
  if (typeof global !== "undefined") return global as ZeedGlobalIntegration
  if (typeof globalThis !== "undefined")
    return globalThis as ZeedGlobalIntegration
  throw new Error("unable to locate global object")
}

export function getGlobalContext(): ZeedGlobalContext {
  let gcontext = _global()
  if (gcontext._zeedGlobal == null) {
    gcontext._zeedGlobal = {}
  }
  return gcontext._zeedGlobal
}
