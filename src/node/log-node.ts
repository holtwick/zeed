// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import tty from "tty"
import { renderMessages, valueToBoolean } from "../common/data/convert"
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
  getStack,
} from "./log-util"
import { formatMilliseconds, getTimestamp } from "../common/time"

function shouldUseColor(): boolean {
  try {
    return valueToBoolean(process.env.ZEED_COLOR, tty.isatty(process.stdout.fd))
  } catch (err) {}
  return false
}

const defaultUseColor: boolean = shouldUseColor()

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

// todo sideffects
let time = getTimestamp()

function log(...args: any[]) {
  process.stdout.write(renderMessages(args) + "\n")
}

// const _browserStyleMap = {
//   [BOLD]: { "font-weight": "bold" },
//   [UNBOLD]: { "font-weight": "normal" },
//   [BLUE]: { color: "blue" },
//   [GREEN]: { color: "green" },
//   [GREY]: { color: "grey" },
//   [RED]: { color: "red" },
//   [PURPLE]: { color: "purple" },
//   [ORANGE]: { color: "orange" },
//   [UNCOLOR]: { color: "black" },
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

export function colorString(text: string, colorCode: number) {
  const colorStart =
    colorCode === COLOR.ORANGE
      ? TTY_STYLE.ORANGE
      : "\u001B[3" + (colorCode < 8 ? colorCode : "8;5;" + colorCode) + "m"
  return `${colorStart}${text}${colorEnd}`
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

export const loggerStackTraceDebug =
  "loggerStackTraceDebug-7d38e5a9214b58d29734374cdb9521fd964d7485"

export function LoggerNodeHandler(opt: LogHandlerOptions = {}): LogHandler {
  const {
    level = undefined,
    filter = undefined,
    colors = defaultUseColor,
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

    if (colors) {
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

    if (msg.messages?.[0] === loggerStackTraceDebug) {
      console.log(getStack())
    }

    if (stack) {
      let line: string = ""
      if (typeof stack === "boolean") {
        line = getSourceLocationByPrecedingPattern(
          ["at Function.", "at null.log (", "at log ("],
          true
        )
        if (!line) {
          line = getSourceLocation(0, true)
        }
      } else {
        const depth = typeof stack === "number" ? stack : 3
        line = getSourceLocation(depth, true)
      }
      if (line) {
        args.push(colorString(`(${line})`, COLOR.GRAY))
      }
    }
    const sep = "|"
    const charLevel = "."

    switch (msg.level) {
      case LogLevel.info:
        if (levelHelper) args[0] = `I${sep}${charLevel}   ` + args[0]
        log(...args)
        break
      case LogLevel.warn:
        if (levelHelper)
          args[0] =
            (colors
              ? colorString(`W${sep}${charLevel}${charLevel}  `, COLOR.ORANGE)
              : `W${sep}${charLevel}${charLevel}  `) + args[0]
        log(...args)
        break
      case LogLevel.error:
        if (levelHelper)
          args[0] =
            (colors
              ? colorString(
                  `E${sep}${charLevel}${charLevel}${charLevel} `,
                  COLOR.RED
                )
              : `E${sep}${charLevel}${charLevel}${charLevel} `) + args[0]
        log(...args)
        break
      default:
        if (levelHelper) args[0] = `D${sep}    ` + args[0]
        log(...args)
        break
    }
  }
}
