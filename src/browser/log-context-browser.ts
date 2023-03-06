// export {}

import { getGlobalLogger } from '../common/log'
import { isBrowser } from '../common/platform'
import { LoggerBrowserHandler } from './log-browser'
import { LoggerBrowserSetupDebugFactory } from './log-browser-factory'

export function setupBrowserLog() {
  if (isBrowser()) {
    const logger = getGlobalLogger()
    logger.setHandlers([LoggerBrowserHandler()]) // Fallback for previously registered Loggers
    logger.setFactory(LoggerBrowserSetupDebugFactory({}))
  }
}

// setupBrowserLog()
