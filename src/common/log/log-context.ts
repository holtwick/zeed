import { isNotNull } from '../data/is'
import type { LogHandler, LogLevel, LogLevelAliasType, LogMessage, LoggerContextInterface, LoggerInterface } from './log-base'
import { LogLevelAll, LogLevelDebug, LogLevelError, LogLevelFatal, LogLevelInfo, LogLevelWarn } from './log-base'
import { LoggerConsoleHandler } from './log-console'
import { parseLogLevel, useNamespaceFilter } from './log-filter'

export function LoggerContext(_prefix = ''): LoggerContextInterface {
  let logHandlers: LogHandler[] = [LoggerConsoleHandler()]
  let logCheckNamespace = (_name: string) => true
  let logLock = false
  let logFactory = LoggerBaseFactory
  let logDebug = false

  function LoggerBaseFactory(
    name = '',
    level?: LogLevelAliasType,
  ): LoggerInterface {
    const logLevel = parseLogLevel(level ?? LogLevelAll)

    function defineForLogLevel(fnLevel: LogLevel, fn: any) {
      if (logLevel <= fnLevel)
        return fn
      return () => {}
    }

    const emit = (msg: LogMessage) => {
      // if (log.active === true) {
      //   if (msg.level >= Logger.level && msg.level >= log.level) {
      if (logCheckNamespace(name)) {
        for (const handler of logHandlers) {
          if (handler)
            handler(msg)
        }
      }
      // }
      // }
    }

    const log = defineForLogLevel(LogLevelDebug, (...messages: any[]) => {
      emit({ name, messages, level: LogLevelDebug })
    })

    log.generic = function (level: LogLevel, ...messages: any[]) {
      if (logLevel <= level)
        emit({ name, messages, level })
    }

    log.label = name
    // log.active = true

    log.extend = function (prefix: string): LoggerInterface {
      return logFactory(name ? `${name}:${prefix}` : prefix)
    }

    log.debug = defineForLogLevel(LogLevelDebug, (...messages: any[]) => {
      emit({ name, messages, level: LogLevelDebug })
    })

    log.info = defineForLogLevel(LogLevelInfo, (...messages: any[]) => {
      emit({ name, messages, level: LogLevelInfo })
    })

    log.warn = defineForLogLevel(LogLevelWarn, (...messages: any[]) => {
      emit({ name, messages, level: LogLevelWarn })
    })

    log.error = defineForLogLevel(LogLevelError, (...messages: any[]) => {
      emit({ name, messages, level: LogLevelError })
    })

    log.fatal = defineForLogLevel(LogLevelFatal, (...messages: any[]) => {
      emit({ name, messages, level: LogLevelFatal })
      throw new Error(`${messages.map(String).join(' ')}`)
    })

    log.assert = defineForLogLevel(LogLevelFatal, (condition: unknown, ...args: any) => {
      if (condition == null || (typeof condition === 'number' && Number.isNaN(condition)) || !condition)
        log.fatal(...args)
    })

    return log
  }

  function Logger(name = '', level?: LogLevelAliasType): LoggerInterface {
    const log = logFactory(name, level)
    if (logDebug)
      log.debug(`+++ init of logger "${name}" on level "${log.level}".`)
    return log
  }

  Logger.registerHandler = function (handler: LogHandler) {
    logHandlers.push(handler)
  }

  /** @deprecated */
  Logger.setFilter = function (namespaces: string) {
    logCheckNamespace = useNamespaceFilter(namespaces)
  }

  Logger.setLock = (lock = true) => (logLock = lock)

  Logger.setDebug = (debug = true) => (logDebug = debug)

  Logger.setHandlers = (handlers?: (LogHandler | undefined | null)[]) => {
    if (logFactory !== LoggerBaseFactory)
      logFactory = LoggerBaseFactory
    if (handlers != null && !logLock)
      logHandlers = [...handlers].filter(isNotNull)
  }

  Logger.level = LogLevelAll

  /** @deprecated */
  Logger.setLogLevel = function (level: LogLevel = LogLevelAll) {
    if (logLock)
      return
    Logger.level = level
  }

  Logger.setFactory = function (
    factory: (name?: string) => LoggerInterface,
  ): void {
    if (logLock)
      return
    logFactory = factory
  }

  return Logger
}
