// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import tty from "tty"
import { renderMessages } from "../common/data/convert"
import {
  LogHandler,
  LogHandlerOptions,
  LogLevel,
  LogMessage,
} from "../common/log-base"
import { useLevelFilter, useNamespaceFilter } from "../common/log-filter"
import {
  getSourceLocation,
  getSourceLocationByPrecedingPattern,
} from "../common/log-util"
import { formatMilliseconds, getTimestamp } from "../common/time"

export function isTTY(): boolean {
  try {
    return tty.isatty(process.stdout.fd)
  } catch (err) {}
  return false
}

const colors = [6, 2, 3, 4, 5, 1]

function selectColor(namespace: string) {
  let hash = 0
  for (let i = 0; i < namespace.length; i++) {
    hash = (hash << 5) - hash + namespace.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return colors[Math.abs(hash) % colors.length]
}

let namespaces: Record<string, any> = {}

let time = getTimestamp()

const useColors = tty.isatty(process.stderr.fd)

function log(...args: any[]) {
  return process.stderr.write(renderMessages(args) + "\n")
}

// export const BOLD = Symbol()
// export const UNBOLD = Symbol()
// export const BLUE = Symbol()
// export const GREY = Symbol()
// export const GREEN = Symbol()
// export const RED = Symbol()
// export const PURPLE = Symbol()
// export const ORANGE = Symbol()
// export const UNCOLOR = Symbol()

// const _browserStyleMap = {
//   [BOLD]: pair.create("font-weight", "bold"),
//   [UNBOLD]: pair.create("font-weight", "normal"),
//   [BLUE]: pair.create("color", "blue"),
//   [GREEN]: pair.create("color", "green"),
//   [GREY]: pair.create("color", "grey"),
//   [RED]: pair.create("color", "red"),
//   [PURPLE]: pair.create("color", "purple"),
//   [ORANGE]: pair.create("color", "orange"), // not well supported in chrome when debugging node with inspector - TODO: deprecate
//   [UNCOLOR]: pair.create("color", "black"),
// }

const TTY_STYLE = {
  BOLD: "\u001b[1m",
  UNBOLD: "\u001b[2m",
  RED: "\u001b[31m",
  GREEN: "\u001b[32m",
  BLUE: "\u001b[34m",
  PURPLE: "\u001b[35m",
  GRAY: "\u001b[37m",
  ORANGE: "\u001b[38;5;208m",
  UNCOLOR: "\u001b[0m",
}

enum COLOR {
  RED = 1,
  GREEN = 2,
  BLUE = 4,
  PURPLE = 5,
  GRAY = 7,
  ORANGE = 8,
}

const colorEnd = "\u001B[0m"

export function colorString(value: string, colorCode: number) {
  const colorStart =
    colorCode === COLOR.ORANGE
      ? TTY_STYLE.ORANGE
      : "\u001B[3" + (colorCode < 8 ? colorCode : "8;5;" + colorCode) + "m"
  return `${colorStart}${value}${colorEnd}`
}

export function colorStringList(
  list: Array<any>,
  style: string,
  bold: boolean = true
) {
  return list.map((value) => {
    if (typeof value !== "string") return value
    let start = style
    let end = colorEnd
    if (bold) {
      start = `${TTY_STYLE.BOLD}${start}`
      end = `${end}${TTY_STYLE.BOLD}`
    }
    return `${start}${value}${end}`
  })
}

export function LoggerNodeHandler(opt: LogHandlerOptions = {}): LogHandler {
  const {
    level = undefined,
    filter = undefined,
    colors = isTTY(),
    levelHelper = true,
    nameBrackets = true,
    padding = 0,
    fill = 0,
    stack = true,
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

    let displayName = nameBrackets ? `[${name}]` : name

    if (padding > 0) {
      displayName = displayName.padStart(padding, " ")
    }

    if (fill > 0) {
      displayName = displayName.padEnd(fill, " ")
    }

    if (colors && useColors) {
      const c = ninfo.color
      args = [colorString(displayName, c) + ` | `] // nameBrackets ? [`%c[${name}]`] : [`%c${name}`]
      if (msg.level === LogLevel.warn) {
        args.push(...colorStringList(msg.messages, TTY_STYLE.ORANGE))
      } else if (msg.level === LogLevel.error) {
        args.push(...colorStringList(msg.messages, TTY_STYLE.RED))
      } else {
        args.push(...msg.messages)
      }
      args.push(colorString(`+${diff}`, c))
    } else {
      args = [displayName, ...msg.messages]
      args.push(`+${diff}`)
    }

    if (stack) {
      let line: string = ""
      if (typeof stack === "boolean") {
        line = getSourceLocationByPrecedingPattern(
          ["at Function.LoggerBaseFactory.", "at null.log (", "at log ("],
          true
        )
      } else {
        const depth = typeof stack === "number" ? stack : 3
        line = getSourceLocation(depth, true)
      }
      if (line) {
        args.push(colorString(`(${line})`, COLOR.GRAY))
      }
    }
    switch (msg.level) {
      case LogLevel.info:
        if (levelHelper) args[0] = `I|*   ` + args[0]
        log(...args)
        break
      case LogLevel.warn:
        if (levelHelper)
          args[0] =
            (colors && useColors
              ? colorString(`W|**  `, COLOR.ORANGE)
              : `W|**  `) + args[0]
        log(...args)
        break
      case LogLevel.error:
        if (levelHelper)
          args[0] =
            (colors && useColors
              ? colorString(`E|*** `, COLOR.RED)
              : `E|*** `) + args[0]
        log(...args)
        break
      default:
        if (levelHelper) args[0] = `D|    ` + args[0]
        log(...args)
        break
    }
  }
}
