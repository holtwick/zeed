import type { LoggerInterface } from './log-base'
import { LogLevelDebug, LogLevelError, LogLevelInfo, LogLevelWarn } from './log-base'

let onlyOnce: boolean | undefined

/**
 * Overrides the global console methods to capture log messages and forward them to the provided logger.
 * Also captures window errors and unhandled rejections and logs them using the provided logger.
 *
 * @param log - The logger to which the captured log messages will be forwarded.
 */
export function logCaptureConsole(log: LoggerInterface) {
  if (onlyOnce) {
    log.error('use logCaptureConsole only once!')
    return
  }

  onlyOnce = true

  globalThis.console.log = (...args: any[]) => log.generic(LogLevelDebug, ...args)
  globalThis.console.debug = (...args: any[]) => log.generic(LogLevelDebug, ...args)
  globalThis.console.warn = (...args: any[]) => log.generic(LogLevelWarn, ...args)
  globalThis.console.error = (...args: any[]) => log.generic(LogLevelError, ...args)
  globalThis.console.info = (...args: any[]) => log.generic(LogLevelInfo, ...args)

  globalThis.addEventListener?.('unhandledrejection', (event: any) => {
    log.generic(LogLevelError, 'onUnhandledrejection', event)
  })

  globalThis.addEventListener?.('error', (event: any) => {
    log.generic(LogLevelError, 'onError', event)
  })
}
