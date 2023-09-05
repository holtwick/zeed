import { isEmpty } from '../../common'
import { getGlobalLogger } from '../../common/log'
import type { LogLevelAliasType, LoggerInterface } from '../../common/log/log-base'
import { isBrowser } from '../../common/platform'
import { LoggerBrowserHandler } from './log-browser'
import { LoggerBrowserSetupDebugFactory } from './log-browser-factory'

export function Logger(name?: string, level?: LogLevelAliasType): LoggerInterface {
  return getGlobalLogger((context) => {
    if (isBrowser() && !isEmpty(localStorage.getItem('zeed'))) {
      context.setHandlers([LoggerBrowserHandler()]) // Fallback for previously registered Loggers
      context.setFactory(LoggerBrowserSetupDebugFactory({}))
    }
  })(name, level)
}
