// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { deepEqual } from "./data/deep"
import { LoggerConsoleHandler } from "./log-console"
import { useNamespaceFilter } from "./log-filter"

export enum LogLevel {
  all = -1,
  debug = 0,
  info,
  warn,
  error,
  fatal,
  off = Infinity,
}

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
}

export interface LoggerContextInterface {
  (name?: string): LoggerInterface
  registerHandler(handler: LogHandler): void
  setFilter(namespaces: string): void
  setHandlers(handlers?: LogHandler[]): void
  setLock(lock: boolean): void
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
  stack?: boolean
}

export function LoggerContext(prefix: string = ""): LoggerContextInterface {
  let logHandlers: LogHandler[] = [LoggerConsoleHandler()]
  let logAssertLevel: LogLevel = LogLevel.warn
  let logCheckNamespace = (name: string) => true
  let logLock = false
  let logFactory = LoggerBaseFactory

  function LoggerBaseFactory(name: string = ""): LoggerInterface {
    log.extend = function (prefix: string): LoggerInterface {
      return logFactory(name ? `${name}:${prefix}` : prefix)
    }

    const emit = (msg: LogMessage) => {
      if (log.active === true) {
        if (msg.level >= Logger.level && msg.level >= log.level) {
          if (logCheckNamespace(name)) {
            for (let handler of logHandlers) {
              if (handler) handler(msg)
            }
          }
        }
      }
    }

    function log(...messages: any[]) {
      emit({
        name,
        messages,
        level: LogLevel.debug,
      })
    }

    log.active = true
    log.level = LogLevel.all

    log.debug = function (...messages: any[]) {
      emit({
        name,
        messages,
        level: LogLevel.debug,
      })
    }

    log.info = function (...messages: any[]) {
      emit({
        name,
        messages,
        level: LogLevel.info,
      })
    }

    log.warn = function (...messages: any[]) {
      emit({
        name,
        messages,
        level: LogLevel.warn,
      })
    }

    log.error = function (...messages: any[]) {
      emit({
        name,
        messages,
        level: LogLevel.error,
      })
    }

    // fatal(...args: any[]) {
    //   console.error(...args)
    // },

    log.assert = function (cond: any, ...messages: any[]) {
      if (!cond) {
        if (typeof console !== undefined) {
          if (console.assert) {
            // https://developer.mozilla.org/de/docs/Web/API/Console/assert
            console.assert(cond, ...messages)
          } else {
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
    }

    log.assertEqual = function (value: any, expected: any, ...args: any[]) {
      let equal = deepEqual(value, expected)
      if (!equal) {
        log.assert(
          equal,
          `Assert did fail. Expected ${expected} got ${value}`,
          expected,
          value,
          ...args
        )
        // } else {
        //   methods.debug(`Passed equal`)
      }
    }

    log.assertNotEqual = function (value: any, expected: any, ...args: any[]) {
      let equal = deepEqual(value, expected)
      if (equal) {
        log.assert(
          equal,
          `Assert did fail. Expected ${expected} not to be equal with ${value}`,
          expected,
          value,
          ...args
        )
        // } else {
        //   methods.debug(`Passed not equal check`)
      }
    }

    return log
  }

  function Logger(name: string = ""): LoggerInterface {
    return logFactory(name)
  }

  Logger.registerHandler = function (handler: LogHandler) {
    logHandlers.push(handler)
  }

  Logger.setFilter = function (namespaces: string) {
    logCheckNamespace = useNamespaceFilter(namespaces)
  }

  Logger.setLock = (lock: boolean = true) => (logLock = lock)

  Logger.setHandlers = function (handlers: LogHandler[] = []) {
    if (logFactory !== LoggerBaseFactory) {
      logFactory = LoggerBaseFactory
    }
    if (logLock) return
    logHandlers = [...handlers].filter((h) => typeof h === "function")
  }

  Logger.level = LogLevel.all

  /** @deprecated */
  Logger.setLogLevel = function (level: LogLevel = LogLevel.all) {
    if (logLock) return
    Logger.level = level
  }

  Logger.setFactory = function (
    factory: (name?: string) => LoggerInterface
  ): void {
    if (logLock) return
    logFactory = factory
  }

  return Logger
}
