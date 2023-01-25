// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

/* eslint-disable no-console */

import type { LogHandlerOptions, LogLevelAliasType, LoggerInterface } from '../common/log-base'
import { LogLevel } from '../common/log-base'
import { parseLogLevel, useNamespaceFilter } from '../common/log-filter'
import { selectColor, supportsColors } from './log-colors'

const styleFont = 'font-family: "JetBrains Mono", Menlo; font-size: 11px;'
const styleDefault = `${styleFont}`
const styleBold = `font-weight: 600; ${styleFont}`
const useColors = supportsColors()

const noop: any = () => {}

export function LoggerBrowserSetupDebugFactory(opt: LogHandlerOptions = {}) {
  const filter = opt.filter ?? localStorage.zeed ?? localStorage.debug

  /// The trick is, that console called directly provides a reference to the source code.
  /// For the regular implementation this information is lost. But this approach has other
  /// drawbacks, therefore only use it in the Browser when actively debugging.
  return function LoggerBrowserDebugFactory(
    name = '',
    logLevel?: LogLevelAliasType,
  ): LoggerInterface {
    let log: LoggerInterface

    const matches = useNamespaceFilter(filter)
    const level = parseLogLevel(logLevel ?? LogLevel.all)

    if (matches(name) && level !== LogLevel.off) {
      const fixedArgs = []
      if (useColors) {
        const color = selectColor(name)
        fixedArgs.push(`%c${name.padEnd(16, ' ')}%c \t%s`)
        fixedArgs.push(`color:${color}; ${styleBold}`)
        fixedArgs.push(styleDefault)
      }
      else {
        fixedArgs.push(`[${name}] \t%s`)
      }

      function defineForLogLevel(fnLevel: LogLevel, fn: any) {
        if (level <= fnLevel)
          return fn
        return () => {}
      }

      log = defineForLogLevel(LogLevel.debug, console.debug.bind(console, ...fixedArgs) as LoggerInterface)
      log.debug = defineForLogLevel(LogLevel.debug, console.debug.bind(console, ...fixedArgs))
      log.info = defineForLogLevel(LogLevel.info, console.info.bind(console, ...fixedArgs))
      log.warn = defineForLogLevel(LogLevel.warn, console.warn.bind(console, ...fixedArgs))
      log.error = defineForLogLevel(LogLevel.error, console.error.bind(console, ...fixedArgs))

      log.fatal = defineForLogLevel(LogLevel.fatal, (...args: any) => {
        log.error(...args)
        throw new Error(`${args.map(String).join(' ')}`)
      })

      log.assert = defineForLogLevel(LogLevel.fatal, (cond: unknown, ...args: any) => {
        if (cond == null || !cond)
          log.fatal(...args)
      })
    }
    else {
      log = (() => {}) as LoggerInterface
      log.debug = noop
      log.info = noop
      log.warn = noop
      log.error = noop
      log.assert = noop
      log.fatal = noop
    }

    log.extend = (subName: string) => {
      return LoggerBrowserDebugFactory(name ? `${name}:${subName}` : subName)
    }

    log.label = name

    return log
  }
}

/** @deprecated This output is default for initial use of Logger in browser environments. */
export function activateConsoleDebug(_opt: LogHandlerOptions = {}) {
  console.info('activateConsoleDebug is activated by default in browsers')
  //   Logger.setHandlers([LoggerBrowserHandler(opt)]) // Fallback for previously registered Loggers
  //   Logger.setFactory(LoggerBrowserSetupDebugFactory(opt))
}

// let klass = console
// let debug = console.debug.bind(window.console, klass.toString() + ": ")

// debug("test")
// console.debug("test2")

// let dd
// if (Function.prototype.bind) {
//   dd = Function.prototype.bind.call(console.log, console)
// } else {
//   dd = function () {
//     Function.prototype.apply.call(console.log, console, arguments)
//   }
// }

// dd("dd")

// let c = 1
// Object.defineProperty(window, "log2", {
//   get: () => {
//     return console.log.bind(
//       window.console,
//       "%c[log]%c %s" + c++,
//       "color:red",
//       ""
//     )
//   },
// })

// // usage:
// log2("Back to the future")
// log2("Back to the future")

// let plog = new Proxy(console.debug, {
//   apply: function (target, that, args) {
//     target.apply(that, args)
//     // base.apply(that, args);
//   },
// })

// let cons = console.debug
// let plog = (...args) => {
//   cons.apply(window.console, ["|", ...args])
// }

// plog("xxx")

// function a() {
//   var err = new Error()
//   var caller_line = err.stack.split("\n")[2]
//   var index = caller_line.indexOf("at ")
//   var clean = caller_line.slice(index + 2, caller_line.length)
//   clean = clean.replace(/\?t=\d+/, "").replace("@fs/", "")
//   console.log(clean)
//   console.log(
//     "http://localhost:8080/Users/dirk/work/viidoo/lib/src/browser/log-browser.ts:188:1 log-browser.ts:291:10"
//   )
// }
// function b() {
//   a()
// }
// b()
