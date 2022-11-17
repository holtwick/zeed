// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

/* eslint-disable no-console */

import { deepEqual } from './data/deep'
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

export interface LoggerInterface {
  (...messages: any[]): void

  /** @deprecated use .level = LogLevel.off or LogLevel.all */
  active: boolean

  level: LogLevel

  debug(...messages: any[]): void

  info(...messages: any[]): void

  warn(...messages: any[]): void

  error(...messages: any[]): void

  assert(cond: any, ...messages: any[]): void

  /** @deprecated use .assert */
  assertEqual(value: any, expected: any, ...args: any[]): void

  /** @deprecated use .assert */
  assertNotEqual(value: any, expected: any, ...args: any[]): void

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

const noop: any = () => {}

export function LoggerContext(_prefix = ''): LoggerContextInterface {
  let logHandlers: LogHandler[] = [LoggerConsoleHandler()]
  const logAssertLevel: LogLevel = LogLevel.warn
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
      return noop
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

    // fatal(...args: any[]) {
    //   console.error(...args)
    // },

    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
    log.assert = defineForLogLevel(LogLevel.error, (cond: any, ...messages: any[]): asserts cond => {
      if (!cond) {
        if (typeof console !== undefined) {
          if (console.assert) {
            // https://developer.mozilla.org/de/docs/Web/API/Console/assert
            console.assert(cond, ...messages)
          }
          else {
            console.error(`Assert did fail with: ${cond}`, ...messages)
          }
        }
        emit({
          name,
          messages: messages || [`Assert did fail with: ${cond}`],
          level: logAssertLevel,
        })
        // try {
        //   if (typeof expect !== undefined) {
        //     expect(cond).toBeTruthy()
        //   }
        // } catch (err) {
        //   methods.warn(...args)
        // }
      }
    })

    log.assertEqual = defineForLogLevel(LogLevel.error, (value: any, expected: any, ...args: any[]) => {
      const equal = deepEqual(value, expected)
      if (!equal) {
        log.assert(
          equal,
          `Assert did fail. Expected ${expected} got ${value}`,
          expected,
          value,
          ...args,
        )
        // } else {
        //   methods.debug(`Passed equal`)
      }
    })

    log.assertNotEqual = defineForLogLevel(LogLevel.error, (value: any, expected: any, ...args: any[]) => {
      const equal = deepEqual(value, expected)
      if (equal) {
        log.assert(
          equal,
          `Assert did fail. Expected ${expected} not to be equal with ${value}`,
          expected,
          value,
          ...args,
        )
        // } else {
        //   methods.debug(`Passed not equal check`)
      }
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
