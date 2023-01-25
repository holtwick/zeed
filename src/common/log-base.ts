// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { LoggerConsoleHandler } from './log-console'
import { parseLogLevel, useNamespaceFilter } from './log-filter'

export enum LogLevel {
  all = -1,
  debug = 0,
  info,
  warn,
  error,
  fatal,
  off = Infinity,
}

export const LogLevelAlias: Record<string, LogLevel> = {
  '*': LogLevel.all,
  'a': LogLevel.all,
  'all': LogLevel.all,
  'd': LogLevel.debug,
  'dbg': LogLevel.debug,
  'debug': LogLevel.debug,
  'i': LogLevel.info,
  'inf': LogLevel.info,
  'info': LogLevel.info,
  'w': LogLevel.warn,
  'warn': LogLevel.warn,
  'warning': LogLevel.warn,
  'e': LogLevel.error,
  'err': LogLevel.error,
  'error': LogLevel.error,
  'fatal': LogLevel.fatal,
  'off': LogLevel.off,
  '-': LogLevel.off,
}

export type LogLevelAliasKey = keyof typeof LogLevelAlias
export type LogLevelAliasType = LogLevel | boolean | LogLevelAliasKey

export interface LogMessage {
  level: LogLevel
  name: string
  messages: any[]
  line?: number
  file?: string
  timestamp?: number
}

export type LogHandler = (msg: LogMessage) => void

export type LogAssert = (condition: unknown, ...messages: any[]) => void // asserts condition -> see https://github.com/microsoft/TypeScript/issues/34523

export interface LoggerInterface {
  (...messages: any[]): void

  /** @deprecated use .level = LogLevel.off or LogLevel.all */
  active: boolean

  level: LogLevel

  debug(...messages: any[]): void

  info(...messages: any[]): void

  warn(...messages: any[]): void

  error(...messages: any[]): void

  /** Throws if condition is not truthy */
  assert: LogAssert

  /** Always throws */
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
    const logLevel = parseLogLevel(level ?? LogLevel.all)

    function defineForLogLevel(fnLevel: LogLevel, fn: any) {
      if (logLevel <= fnLevel)
        return fn
      return () => {}
    }

    const log = defineForLogLevel(LogLevel.debug, (...messages: any[]) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      emit({
        name,
        messages,
        level: LogLevel.debug,
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

    log.debug = defineForLogLevel(LogLevel.debug, (...messages: any[]) => {
      emit({ name, messages, level: LogLevel.debug })
    })

    log.info = defineForLogLevel(LogLevel.info, (...messages: any[]) => {
      emit({ name, messages, level: LogLevel.info })
    })

    log.warn = defineForLogLevel(LogLevel.warn, (...messages: any[]) => {
      emit({ name, messages, level: LogLevel.warn })
    })

    log.error = defineForLogLevel(LogLevel.error, (...messages: any[]) => {
      emit({ name, messages, level: LogLevel.error })
    })

    log.fatal = defineForLogLevel(LogLevel.fatal, (...messages: any[]) => {
      emit({ name, messages, level: LogLevel.fatal })
      throw new Error(`${messages.map(String).join(' ')}`)
    })

    log.assert = defineForLogLevel(LogLevel.fatal, (cond: unknown, ...args: any) => {
      if (!cond)
        log.fatal(...args)
    })

    return log
  }

  function Logger(
    name = '',
    level?: LogLevelAliasType,
  ): LoggerInterface {
    const log = logFactory(name, level)
    if (logDebug)
      log.debug(`+++ init of logger "${name}" on level "${LogLevel[log.level]}".`)
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

  Logger.level = LogLevel.all

  /** @deprecated */
  Logger.setLogLevel = function (level: LogLevel = LogLevel.all) {
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
