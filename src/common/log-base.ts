// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { LoggerConsoleHandler } from './log-console'
import { parseLogLevel, useNamespaceFilter } from './log-filter'

export type LogLevel = number

export const LogLevelAll = -1
export const LogLevelDebug = 0
export const LogLevelInfo = 1
export const LogLevelWarn = 2
export const LogLevelError = 3
export const LogLevelFatal = 4
export const LogLevelOff = 9007199254740991 // `Infinity` ===  `1 / 0`, but bad for sideEffects, therefore `Math.pow(2, 53) - 1`

export const LogLevelAlias: Record<string, LogLevel> = {
  '*': LogLevelAll,
  'a': LogLevelAll,
  'all': LogLevelAll,
  'd': LogLevelDebug,
  'dbg': LogLevelDebug,
  'debug': LogLevelDebug,
  'i': LogLevelInfo,
  'inf': LogLevelInfo,
  'info': LogLevelInfo,
  'w': LogLevelWarn,
  'warn': LogLevelWarn,
  'warning': LogLevelWarn,
  'e': LogLevelError,
  'err': LogLevelError,
  'error': LogLevelError,
  'fatal': LogLevelFatal,
  'off': LogLevelOff,
  '-': LogLevelOff,
}

export type LogLevelAliasKey = keyof typeof LogLevelAlias
export type LogLevelAliasType = number | boolean | LogLevelAliasKey

export interface LogMessage {
  level: LogLevel
  name: string
  messages: any[]
  line?: number
  file?: string
  timestamp?: number
}

export type LogHandler = (msg: LogMessage) => void

export interface LoggerInterface {
  (...messages: any[]): void

  /** @deprecated use .level = LogLevel.off or LogLevel.all */
  active: boolean

  level: LogLevel

  debug(...messages: any[]): void

  info(...messages: any[]): void

  warn(...messages: any[]): void

  error(...messages: any[]): void

  /**
   * Throws if condition is not truthy.
   *
   * **Attention!**  Due to a bug in typescript you will need to explicitly set the `LoggerInterface` type in
   * order to have the assertions having an effect on unreachable code. Example:
   *
   * ```ts
   * const log: LoggerInterface = Logger('xxx')
   * ```
   *
   * Bug https://github.com/microsoft/TypeScript/issues/50363#issuecomment-1219811447
   */
  assert(condition: unknown, ...messages: any[]): asserts condition

  /**
   * Always throws.
   *
   * **Attention!** Due to a bug in typescript you will need to explicitly set the `LoggerInterface` type in
   * order to have the assertions having an effect on unreachable code. Example:
   *
   * ```ts
   * const log: LoggerInterface = Logger('xxx')
   * ```
   *
   * Bug https://github.com/microsoft/TypeScript/issues/50363#issuecomment-1219811447
   */
  fatal(...messages: any[]): never

  extend(prefix: string): LoggerInterface

  factory?: LoggerContextInterface

  label: string
}

export interface LoggerContextInterface {
  (name?: string, level?: LogLevelAliasType): LoggerInterface

  registerHandler(handler: LogHandler): void

  setFilter(namespaces: string): void

  setHandlers(handlers?: (LogHandler | undefined | null)[]): void

  setLock(lock: boolean): void

  /** When true emits a short log message for each Logger when being set up first time. */
  setDebug(debug: boolean): void

  setLogLevel(level?: LogLevel): void

  setFactory(factory: (name?: string) => LoggerInterface): void
}

export interface LogHandlerOptions {
  level?: LogLevel
  filter?: string
  colors?: boolean
  levelHelper?: boolean
  nameBrackets?: boolean
  padding?: number
  fill?: number
  stack?: boolean | number
  time?: boolean
  pretty?: boolean
}

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

    const log = defineForLogLevel(LogLevelDebug, (...messages: any[]) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      emit({
        name,
        messages,
        level: LogLevelDebug,
      })
    })

    log.label = name
    // log.active = true

    log.extend = function (prefix: string): LoggerInterface {
      return logFactory(name ? `${name}:${prefix}` : prefix)
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

    log.assert = defineForLogLevel(LogLevelFatal, (cond: unknown, ...args: any) => {
      if (!cond)
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

  Logger.setHandlers = function (handlers: LogHandler[] = []) {
    if (logFactory !== LoggerBaseFactory)
      logFactory = LoggerBaseFactory

    if (logLock)
      return
    logHandlers = [...handlers].filter(h => typeof h === 'function')
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
