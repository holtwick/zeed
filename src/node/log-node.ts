// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import tty from 'node:tty'
import process from 'node:process'
import { renderMessages, valueToBoolean } from '../common/data/convert'
import type { LogHandler, LogHandlerOptions, LogMessage } from '../common/log-base'
import { LogLevelError, LogLevelInfo, LogLevelWarn } from '../common/log-base'
import { useLevelFilter, useNamespaceFilter } from '../common/log-filter'
import { formatMilliseconds, getTimestamp } from '../common/time'
import { getSourceLocation, getSourceLocationByPrecedingPattern, getStack } from './log-util'

function shouldUseColor(): boolean {
  try {
    return valueToBoolean(process.env.ZEED_COLOR, tty.isatty(process.stdout.fd))
  }
  catch (err) {}
  return false
}

let defaultUseColor: boolean | undefined

const colors = [6, 2, 3, 4, 5, 1]

function nodeSelectColorByName(namespace: string) {
  let hash = 0
  for (let i = 0; i < namespace.length; i++) {
    hash = (hash << 5) - hash + namespace.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return colors[Math.abs(hash) % colors.length]
}

const namespaces: Record<string, any> = {}

let startTime: number | undefined

function log(...args: any[]) {
  process.stdout.write(`${renderMessages(args)}\n`)
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
  BOLD: '\u001B[1m',
  UNBOLD: '\u001B[2m',
  RED: '\u001B[31m',
  GREEN: '\u001B[32m',
  BLUE: '\u001B[34m',
  PURPLE: '\u001B[35m',
  GRAY: '\u001B[37m',
  ORANGE: '\u001B[38;5;208m',
  UNCOLOR: '\u001B[0m',
}

enum COLOR {
  RED = 1,
  GREEN = 2,
  BLUE = 4,
  PURPLE = 5,
  GRAY = 7,
  ORANGE = 8,
}

const colorEnd = '\u001B[0m'

export function colorString(text: string, colorCode: number) {
  const colorStart = colorCode === COLOR.ORANGE
    ? TTY_STYLE.ORANGE
    : `\u001B[3${colorCode < 8 ? colorCode : `8;5;${colorCode}`}m`
  return `${colorStart}${text}${colorEnd}`
}

export function colorStringList(
  list: Array<any>,
  style: string,
  bold = true,
) {
  return list.map((value) => {
    if (typeof value !== 'string')
      return value
    let start = style
    let end = colorEnd
    if (bold) {
      start = `${TTY_STYLE.BOLD}${start}`
      end = `${end}${TTY_STYLE.BOLD}`
    }
    return `${start}${value}${end}`
  })
}

function shouldUseStack(): boolean {
  try {
    return valueToBoolean(process.env.ZEED_STACK, false)
  }
  catch (err) {}
  return false
}

let defaultUseStack: boolean | undefined

export const loggerStackTraceDebug = 'loggerStackTraceDebug-7d38e5a9214b58d29734374cdb9521fd964d7485'

export function LoggerNodeHandler(opt: LogHandlerOptions = {}): LogHandler {
  if (defaultUseColor == null)
    defaultUseColor = shouldUseColor()

  if (defaultUseStack == null)
    defaultUseStack = shouldUseStack()

  if (startTime == null)
    startTime = getTimestamp()

  const {
    level = undefined,
    filter = undefined,
    colors = defaultUseColor,
    levelHelper = true,
    nameBrackets = true,
    padding = 0,
    fill = 0,
    stack = defaultUseStack,
    time = true,
  } = opt
  const matchesNamespace = useNamespaceFilter(filter)
  const matchesLevel = useLevelFilter(level)
  return (msg: LogMessage) => {
    if (!matchesLevel(msg.level))
      return
    if (!matchesNamespace(msg.name))
      return
    const timeNow = getTimestamp()
    const name = msg.name || ''
    let ninfo = namespaces[name || '']
    if (ninfo == null) {
      ninfo = {
        color: nodeSelectColorByName(name),
        // time: timeNow
      }
      namespaces[name] = ninfo
    }
    const timeDiffString = formatMilliseconds(timeNow - startTime!)

    let args: string[]

    let displayName = nameBrackets ? `[${name}]` : name

    if (padding > 0)
      displayName = displayName.padStart(padding, ' ')

    if (fill > 0)
      displayName = displayName.padEnd(fill, ' ')

    if (colors) {
      const c = ninfo.color
      args = [`${colorString(displayName, c)} | `] // nameBrackets ? [`%c[${name}]`] : [`%c${name}`]
      if (msg.level === LogLevelWarn)
        args.push(...colorStringList(msg.messages, TTY_STYLE.ORANGE))
      else if (msg.level === LogLevelError)
        args.push(...colorStringList(msg.messages, TTY_STYLE.RED))
      else
        args.push(...msg.messages)
      if (time)
        args.push(colorString(`+${timeDiffString}`, c))
    }
    else {
      args = [displayName, ...msg.messages]
      if (time)
        args.push(`+${timeDiffString}`)
    }

    if (msg.messages?.[0] === loggerStackTraceDebug) {
      // eslint-disable-next-line no-console
      console.log(getStack())
    }

    // Probably time consuming
    if (stack) {
      let line = ''
      if (typeof stack === 'boolean') {
        line = getSourceLocationByPrecedingPattern(
          ['at Function.', 'at null.log (', 'at log ('],
          true,
        )
        if (!line)
          line = getSourceLocation(0, true)
      }
      else {
        const depth = typeof stack === 'number' ? stack : 3
        line = getSourceLocation(depth, true)
      }
      if (line)
        args.push(colorString(`(${line})`, COLOR.GRAY))
    }

    const sep = '|'
    const charLevel = '.'

    switch (msg.level) {
      case LogLevelInfo:
        if (levelHelper)
          args[0] = `I${sep}${charLevel}   ${args[0]}`
        log(...args)
        break
      case LogLevelWarn:
        if (levelHelper) {
          args[0] = (colors
            ? colorString(`W${sep}${charLevel}${charLevel}  `, COLOR.ORANGE)
            : `W${sep}${charLevel}${charLevel}  `) + args[0]
        }
        log(...args)
        break
      case LogLevelError:
        if (levelHelper) {
          args[0] = (colors
            ? colorString(`E${sep}${charLevel}${charLevel}${charLevel} `, COLOR.RED)
            : `E${sep}${charLevel}${charLevel}${charLevel} `) + args[0]
        }
        log(...args)
        break
      default:
        if (levelHelper)
          args[0] = `D${sep}    ${args[0]}`
        log(...args)
        break
    }
  }
}
