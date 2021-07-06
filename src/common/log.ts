import { deepEqual } from "./deep.js"

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

export function LoggerConsoleHandler(
  level: LogLevel = LogLevel.debug
): LogHandler {
  return (msg: LogMessage) => {
    if (msg.level < level) return
    let name = msg.name ? `[${msg.name}]` : ""
    switch (msg.level) {
      case LogLevel.info:
        console.info(`I|*   ${name}`, ...msg.messages)
        break
      case LogLevel.warn:
        console.warn(`W|**  ${name}`, ...msg.messages)
        break
      case LogLevel.error:
        console.error(`E|*** ${name}`, ...msg.messages)
        break
      default:
        console.debug(`D|    ${name}`, ...msg.messages)
        break
    }
  }
}

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
}

export interface LoggerFactoryInterface {
  (name?: string): LoggerInterface
  registerHandler(handler: LogHandler): void
  _reject: RegExp[]
  _accept: RegExp[]
  setFilter(namespaces: string): void
  _isNamespaceAllowed(name: string): boolean
  _prefix: string
  setPrefix(prefix: string): void
  setHandlers(handlers?: LogHandler[]): void
  level: number
  /** @deprecated */
  setLogLevel(level?: LogLevel): void
  extend(prefix: string): LoggerInterface
  setFactory(factory: (name?: string) => LoggerInterface): void
}

export function LoggerFactory(
  prefix: string = "",
  opt: {
    handlers?: LogHandler[]
    level?: number
    accept?: RegExp[]
    reject?: RegExp[]
  } = {}
): LoggerFactoryInterface {
  let logHandlers: LogHandler[] = opt?.handlers || [LoggerConsoleHandler()]
  let logAssertLevel: LogLevel = LogLevel.warn
  // let logLevel: LogLevel = 0

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
      // return Logger.extend(prefix)
    }

    // This is the trick, log is a function but also an object makes both valid:
    // const log = Logger(); log('test')
    // const {debug, info} = Logger(); info('test')
    return log
  }

  function Logger(name: string = ""): LoggerInterface {
    // console.log("Logger with name", name, Logger._factory)
    return Logger._factory(name)
  }

  Logger.registerHandler = function (handler: LogHandler) {
    logHandlers.push(handler)
  }

  Logger._reject = opt?.reject ?? ([] as RegExp[])
  Logger._accept = opt?.accept ?? ([] as RegExp[])

  Logger.setFilter = function (namespaces: string) {
    Logger._reject = []
    Logger._accept = []
    if (namespaces && namespaces !== "*") {
      let i
      const split = namespaces.split(/[\s,]+/)
      const len = split.length
      for (i = 0; i < len; i++) {
        if (!split[i]) {
          // ignore empty strings
          continue
        }
        namespaces = split[i].replace(/\*/g, ".*?")
        if (namespaces[0] === "-") {
          Logger._reject.push(new RegExp("^" + namespaces.substr(1) + "$"))
        } else {
          Logger._accept.push(new RegExp("^" + namespaces + "$"))
        }
      }
    }
  }

  Logger._isNamespaceAllowed = function (name: string) {
    if (Logger._reject.length === 0 && Logger._accept.length === 0) {
      return true
    }
    let i, len
    for (i = 0, len = Logger._reject.length; i < len; i++) {
      if (Logger._reject[i].test(name)) {
        return false
      }
    }
    for (i = 0, len = Logger._accept.length; i < len; i++) {
      if (Logger._accept[i].test(name)) {
        return true
      }
    }
    return false
  }

  Logger._prefix = prefix

  Logger.setPrefix = function (prefix: string) {
    Logger._prefix = prefix + (prefix.endsWith(":") ? "" : ":")
  }

  Logger.setHandlers = function (handlers: LogHandler[] = []) {
    logHandlers = [...handlers].filter((h) => typeof h === "function")
  }

  Logger.level = opt?.level ?? LogLevel.debug

  /** @deprecated */
  Logger.setLogLevel = function (level: LogLevel = 0) {
    Logger.level = level
    // logLevel = level
  }

  Logger.extend = function (prefix: string) {
    if (Logger._prefix) {
      prefix = Logger._prefix + ":" + prefix
    }
    if (prefix?.length > 0) {
      return LoggerFactory(prefix, {
        handlers: logHandlers,
        level: Logger.level,
        accept: Logger._accept,
        reject: Logger._reject,
      })()
    }
    throw new Error("Logger.extend needs a prefix with minimal length of 1")
  }

  Logger._factory = LoggerBaseFactory
  Logger.setFactory = function (
    factory: (name?: string) => LoggerInterface
  ): void {
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

if (typeof window != null) {
  if (window._zeedGlobalLogger != null) {
    window._zeedGlobalLogger = Logger
  }
}

export const GlobalLogger = window._zeedGlobalLogger || Logger
