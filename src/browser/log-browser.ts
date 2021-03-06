// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { deepEqual } from "../common/data/deep"
import {
  LoggerInterface,
  LogHandler,
  LogHandlerOptions,
  LogLevel,
  LogMessage,
} from "../common/log-base"
import { useLevelFilter, useNamespaceFilter } from "../common/log-filter"
import { formatMilliseconds, getTimestamp } from "../common/time"
import { selectColor, supportsColors } from "./log-colors"

const styleFont = `font-family: "JetBrains Mono", Menlo; font-size: 11px;`
const styleDefault = `${styleFont}`
const styleBold = `font-weight: 600; ${styleFont}`
const useColors = supportsColors()

let namespaces: Record<string, any> = {}

let time = getTimestamp() // todo sideffects

export function LoggerBrowserHandler(opt: LogHandlerOptions = {}): LogHandler {
  const {
    filter = undefined,
    level = undefined,
    colors = true,
    levelHelper = false,
    nameBrackets = true,
    padding = 16,
  } = opt
  const matchesNamespace = useNamespaceFilter(filter)
  const matchesLevel = useLevelFilter(level)
  return (msg: LogMessage) => {
    if (!matchesLevel(msg.level)) return
    if (!matchesNamespace(msg.name)) return

    const timeNow = getTimestamp()
    let name = msg.name || ""
    let ninfo = namespaces[name || ""]
    if (ninfo == null) {
      ninfo = {
        color: selectColor(name),
        // time: timeNow
      }
      namespaces[name] = ninfo
    }
    const diff = formatMilliseconds(timeNow - time)
    let args: string[]

    if (padding > 0) {
      name = name.padEnd(16, " ")
    }

    if (colors && useColors) {
      args = [`%c${name}%c \t%s %c+${diff}`]
      args.push(`color:${ninfo.color}; ${styleBold}`)
      args.push(styleDefault)
      args.push(msg.messages?.[0] ?? "")
      args.push(`color:${ninfo.color};`)
      args.push(...msg.messages.slice(1))
    } else {
      args = [name, ...msg.messages, `+${diff}`]
    }

    // function consoleArgs(args: any[] = []): any[] {
    //   return [
    //     args
    //       .filter((a) => typeof a === "string")
    //       .map((a) => String(a))
    //       .join(" "),
    //     ...styles,
    //     ...args.filter((a) => typeof a !== "string"),
    //   ]
    // }

    switch (msg.level) {
      case LogLevel.info:
        if (opt.levelHelper) args[0] = `I|*   ` + args[0]
        console.info(...args)
        break
      case LogLevel.warn:
        if (opt.levelHelper) args[0] = `W|**  ` + args[0]
        console.warn(...args)
        break
      case LogLevel.error:
        if (opt.levelHelper) args[0] = `E|*** ` + args[0]
        console.error(...args)
        break
      default:
        if (opt.levelHelper) args[0] = `D|    ` + args[0]
        console.debug(...args)
        break
    }
  }
}

export function LoggerBrowserSetupDebugFactory(opt: LogHandlerOptions = {}) {
  const filter = opt.filter ?? localStorage.zeed ?? localStorage.debug

  /// The trick is, that console called directly provides a reference to the source code.
  /// For the regular implementation this information is lost. But this approach has other
  /// drawbacks, therefore only use it in the Browser when actively debugging.
  return function LoggerBrowserDebugFactory(
    name: string = ""
  ): LoggerInterface {
    let log: LoggerInterface

    const matches = useNamespaceFilter(filter)

    if (matches(name)) {
      let fixedArgs = []
      if (useColors) {
        const color = selectColor(name)
        fixedArgs.push(`%c${name.padEnd(16, " ")}%c \t%s`)
        fixedArgs.push(`color:${color}; ${styleBold}`)
        fixedArgs.push(styleDefault)
      } else {
        fixedArgs.push(`[${name}] \t%s`)
      }

      // @ts-ignore
      // console.previous = {
      //   debug: console.debug,
      //   info: console.info,
      //   warn: console.warn,
      //   error: console.error,
      //   assert: console.assert,
      // }

      log = console.debug.bind(console, ...fixedArgs) as LoggerInterface
      log.debug = console.debug.bind(console, ...fixedArgs)
      log.info = console.info.bind(console, ...fixedArgs)
      log.warn = console.warn.bind(console, ...fixedArgs)
      log.error = console.error.bind(console, ...fixedArgs)

      log.assert = console.assert.bind(console)

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
        }
      }

      log.assertNotEqual = function (
        value: any,
        expected: any,
        ...args: any[]
      ) {
        let equal = deepEqual(value, expected)
        if (equal) {
          log.assert(
            equal,
            `Assert did fail. Expected ${expected} not to be equal with ${value}`,
            expected,
            value,
            ...args
          )
        }
      }
    } else {
      const noop = () => {}
      log = noop as LoggerInterface
      log.debug = noop
      log.info = noop
      log.warn = noop
      log.error = noop

      log.assert = noop
      log.assertEqual = noop
      log.assertNotEqual = noop
    }

    log.extend = (subName: string) => {
      return LoggerBrowserDebugFactory(name ? `${name}:${subName}` : subName)
    }

    log.label = name

    return log
  }
}

/** @deprecated This output is default for initial use of Logger in browser environments. */
export function activateConsoleDebug(opt: LogHandlerOptions = {}) {
  console.info("activateConsoleDebug is activated by default in browsers")
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
