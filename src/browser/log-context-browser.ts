import { Logger } from '../common/log'
import { isBrowser } from '../common/platform'
import { LoggerBrowserHandler } from './log-browser'
import { LoggerBrowserSetupDebugFactory } from './log-browser-factory'

// todo sideffects
export function setupBrowserLog() {
  if (isBrowser()) {
    Logger.setHandlers([LoggerBrowserHandler()]) // Fallback for previously registered Loggers
    Logger.setFactory(LoggerBrowserSetupDebugFactory({}))
  }
}

setupBrowserLog()
