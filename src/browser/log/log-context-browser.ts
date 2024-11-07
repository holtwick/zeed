import type { LoggerInterface, LogLevelAliasType } from '../../common/log/log-base'
import type { LogConfig } from '../../common/log/log-config'
import { isEmpty } from '../../common/data/is'
import { getGlobalLogger } from '../../common/log/log'
import { _LoggerFromConfig } from '../../common/log/log-config'
import { isBrowser } from '../../common/platform'
import { LoggerBrowserHandler } from './log-browser'
import { LoggerBrowserSetupDebugFactory } from './log-browser-factory'

export function Logger(name?: string, level?: LogLevelAliasType): LoggerInterface {
  return getGlobalLogger((context) => {
    if (isBrowser() && (typeof localStorage !== 'undefined' ? !isEmpty(localStorage?.getItem('zeed')) : false)) {
      context.setHandlers([LoggerBrowserHandler()]) // Fallback for previously registered Loggers
      context.setFactory(LoggerBrowserSetupDebugFactory({}))
    }
  })(name, level)
}

/** See LogConfig */
export function LoggerFromConfig(config: LogConfig, name: string, level?: LogLevelAliasType): LoggerInterface {
  return _LoggerFromConfig(Logger, config, name, level)
}
