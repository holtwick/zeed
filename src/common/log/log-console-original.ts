import { getGlobalContext } from '../global'

// Global logger to guarantee all submodules use the same logger instance

export type OriginalConsole = Pick<Console, 'log' | 'info' | 'warn' | 'error' | 'debug' > & { console: Console }

declare global {
  interface ZeedGlobalContext {
    originalConsole?: OriginalConsole
  }
}

/**
 * Retrieves the global console object, ensuring that it is stored in the global context.
 * If the global context does not have a reference to the original console object, it creates one.
 * The original console object is then bound to the global context, allowing access to its methods.
 */
export function getGlobalConsole(): OriginalConsole {
  const gcontext = getGlobalContext()
  if (gcontext.originalConsole == null) {
    const originalConsole = console
    gcontext.originalConsole = {
      console: originalConsole,
      log: originalConsole.log.bind(originalConsole),
      info: originalConsole.info.bind(originalConsole),
      warn: originalConsole.warn.bind(originalConsole),
      error: originalConsole.error.bind(originalConsole),
      debug: originalConsole.debug.bind(originalConsole),
    }
  }
  return gcontext.originalConsole
}
