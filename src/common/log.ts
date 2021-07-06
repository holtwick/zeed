import { deepEqual } from "./deep.js"
import { LoggerConsoleHandler } from "./log-console.js"
import { useNamespaceFilter } from "./log-filter.js"

export enum LogLevel {
  debug,
  info,
  warn,
  error,
  fatal,
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
  active: boolean
  level: LogLevel
  debug(...messages: any[]): void
  info(...messages: any[]): void
  warn(...messages: any[]): void
  error(...messages: any[]): void
  assert(cond: any, ...messages: any[]): void
  assertEqual(value: any, expected: any, ...args: any[]): void
  assertNotEqual(value: any, expected: any, ...args: any[]): void
  extend(prefix: string): LoggerInterface
  factory?: LoggerFactoryInterface
}

export interface LoggerFactoryInterface {
  (name?: string): LoggerInterface
  registerHandler(handler: LogHandler): void
  setFilter(namespaces: string): void
  setPrefix(prefix: string): void
  setHandlers(handlers?: LogHandler[]): void
  setLock(lock: boolean): void
  level: number
  /** @deprecated */
  setLogLevel(level?: LogLevel): void
  setFactory(factory: (name?: string) => LoggerInterface): void
  // extend(prefix: string): LoggerInterface
}

export function LoggerFactory(prefix: string = ""): LoggerFactoryInterface {
  let logHandlers: LogHandler[] = [LoggerConsoleHandler()]
  let logAssertLevel: LogLevel = LogLevel.warn

  function LoggerBaseFactory(name: string = ""): LoggerInterface {
    name = Logger._prefix + name

    const emit = (msg: LogMessage) => {
      if (log.active === true) {
        if (msg.level >= Logger.level && msg.level >= log.level) {
          if (Logger._isNamespaceAllowed(name)) {
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
    log.level = LogLevel.debug

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

    log.extend = function (prefix: string): LoggerInterface {
      return Logger.extend(name + ":" + prefix)
    }

    // This is the trick, log is a function but also an object makes both valid:
    // const log = Logger(); log('test')
    // const {debug, info} = Logger(); info('test')
    return log
  }

  function Logger(name: string = ""): LoggerInterface {
    return Logger._factory(name)
  }

  Logger.registerHandler = function (handler: LogHandler) {
    logHandlers.push(handler)
  }

  Logger._isNamespaceAllowed = (name: string) => true
  Logger.setFilter = function (namespaces: string) {
    Logger._isNamespaceAllowed = useNamespaceFilter(namespaces)
  }

  Logger._prefix = prefix
  Logger._lock = false

  Logger.setPrefix = function (prefix: string) {
    Logger._prefix = prefix + (prefix.endsWith(":") ? "" : ":")
  }

  Logger.setLock = (lock: boolean = true) => (Logger._lock = lock)

  Logger.setHandlers = function (handlers: LogHandler[] = []) {
    if (Logger._lock) return
    logHandlers = [...handlers].filter((h) => typeof h === "function")
  }

  Logger.level = LogLevel.debug

  /** @deprecated */
  Logger.setLogLevel = function (level: LogLevel = 0) {
    if (Logger._lock) return
    Logger.level = level
  }

  Logger.extend = function (prefix: string) {
    if (Logger._prefix) {
      prefix = Logger._prefix + ":" + prefix
    }
    ;``
    if (prefix?.length > 0) {
      return LoggerFactory(prefix)()
    }
    throw new Error("Logger.extend needs a prefix with minimal length of 1")
  }

  Logger._factory = LoggerBaseFactory

  Logger.setFactory = function (
    factory: (name?: string) => LoggerInterface
  ): void {
    if (Logger._lock) return
    Logger._factory = factory
  }

  return Logger
}

export const Logger = LoggerFactory()

// Global logger to guarantee all submodules use the same logger instance

declare global {
  interface Window {
    _zeedGlobalLogger: LoggerFactoryInterface
  }
}

let globalLogger = Logger

try {
  if (typeof window != null) {
    if (window._zeedGlobalLogger == null) {
      window._zeedGlobalLogger = Logger
    } else {
      globalLogger = window._zeedGlobalLogger
    }
  }
} catch (e) {}

export const GlobalLogger = globalLogger
