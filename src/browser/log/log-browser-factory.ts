import type { LogHandlerOptions, LogLevel, LogLevelAliasType, LoggerInterface } from '../../common/log/log-base'
import { LogLevelAll, LogLevelDebug, LogLevelError, LogLevelFatal, LogLevelInfo, LogLevelOff, LogLevelWarn } from '../../common/log/log-base'
import { browserSelectColorByName } from '../../common/log/log-colors'
import { getGlobalConsole } from '../../common/log/log-console-original'
import { parseLogLevel, useNamespaceFilter } from '../../common/log/log-filter'
import { browserSupportsColors } from './log-colors'

/**
 * Directly use console calls, this has the advantage to show the original source of the call
 * i.e. it is possible to jump right into the code from the browser console logs. But other
 * loggers will not work any more.
 */
export function LoggerBrowserSetupDebugFactory(opt: LogHandlerOptions = {}) {
  const filter = opt.filter ?? localStorage.zeed ?? localStorage.debug
  const styleFont = 'font-family: "JetBrains Mono", Menlo; font-size: 11px;'
  const styleDefault = `${styleFont}`
  const styleBold = `font-weight: 600; ${styleFont}`
  const useColors = browserSupportsColors()
  const noop: any = () => {}

  // logCaptureConsole will override the console methods, so we need to get the original ones
  const originalConsole = getGlobalConsole()

  /**
   * The trick is, that console called directly provides a reference to the source code.
   * For the regular implementation this information is lost. But this approach has other
   * drawbacks, therefore only use it in the Browser when actively debugging.
   */
  return function LoggerBrowserDebugFactory(
    name = '',
    logLevel?: LogLevelAliasType,
  ): LoggerInterface {
    let log: LoggerInterface

    const matches = useNamespaceFilter(filter)
    const level = parseLogLevel(logLevel ?? LogLevelAll)

    if (matches(name) && level !== LogLevelOff) {
      const fixedArgs: string[] = []
      if (useColors) {
        const color = browserSelectColorByName(name)
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

      log = defineForLogLevel(LogLevelDebug, originalConsole.debug.bind(originalConsole.console, ...fixedArgs) as LoggerInterface)
      log.debug = defineForLogLevel(LogLevelDebug, originalConsole.debug.bind(originalConsole.console, ...fixedArgs))
      log.info = defineForLogLevel(LogLevelInfo, originalConsole.info.bind(originalConsole.console, ...fixedArgs))
      log.warn = defineForLogLevel(LogLevelWarn, originalConsole.warn.bind(originalConsole.console, ...fixedArgs))
      log.error = defineForLogLevel(LogLevelError, originalConsole.error.bind(originalConsole.console, ...fixedArgs))

      // /**
      //  * Takes log level as argument, but will fail to show all the debug info
      //  * as the others do like file name and line number of the originating call
      //  */
      // log.generic = (logLevel: LogLevel, ...args) => {
      //   if (level <= logLevel) {
      //     if (logLevel === LogLevelError)
      //       originalConsole.error(...fixedArgs, ...args)
      //     else if (logLevel === LogLevelWarn)
      //       originalConsole.warn(...fixedArgs, ...args)
      //     else if (logLevel === LogLevelInfo)
      //       originalConsole.info(...fixedArgs, ...args)
      //     else
      //       originalConsole.debug(...fixedArgs, ...args)
      //   }
      // }

      log.fatal = defineForLogLevel(LogLevelFatal, (...args: any) => {
        log.error(...args)
        throw new Error(`${args.map(String).join(' ')}`)
      })

      log.assert = defineForLogLevel(LogLevelFatal, (condition: unknown, ...args: any) => {
        if (condition == null || (typeof condition === 'number' && Number.isNaN(condition)) || !condition)
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

// /** @deprecated This output is default for initial use of Logger in browser environments. */
// export function activateConsoleDebug(_opt: LogHandlerOptions = {}) {
//   console.info('activateConsoleDebug is activated by default in browsers')
//   //   Logger.setHandlers([LoggerBrowserHandler(opt)]) // Fallback for previously registered Loggers
//   //   Logger.setFactory(LoggerBrowserSetupDebugFactory(opt))
// }

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
