// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

/* eslint-disable no-console */

import type { LogHandler, LogHandlerOptions, LogMessage } from '../common/log-base'
import { LogLevel } from '../common/log-base'
import { useLevelFilter, useNamespaceFilter } from '../common/log-filter'
import { formatMilliseconds, getTimestamp } from '../common/time'
import { selectColor, supportsColors } from './log-colors'

const styleFont = 'font-family: "JetBrains Mono", Menlo; font-size: 11px;'
const styleDefault = `${styleFont}`
const styleBold = `font-weight: 600; ${styleFont}`
const useColors = supportsColors()

const namespaces: Record<string, any> = {}

const startTime = getTimestamp() // todo sideffects

export function LoggerBrowserHandler(opt: LogHandlerOptions = {}): LogHandler {
  const {
    filter = undefined,
    level = undefined,
    colors = true,
    // levelHelper = false,
    // nameBrackets = true,
    padding = 16,
    time = true,
  } = opt
  const matchesNamespace = useNamespaceFilter(filter)
  const matchesLevel = useLevelFilter(level)
  return (msg: LogMessage) => {
    if (!matchesLevel(msg.level))
      return
    if (!matchesNamespace(msg.name))
      return

    const timeDiffString = time ? `+${formatMilliseconds(getTimestamp() - startTime)}` : ''

    let name = msg.name || ''
    let ninfo = namespaces[name || '']
    if (ninfo == null) {
      ninfo = {
        color: selectColor(name),
        // time: timeNow
      }
      namespaces[name] = ninfo
    }
    let args: string[]

    if (padding > 0)
      name = name.padEnd(16, ' ')

    if (colors && useColors) {
      args = [`%c${name}%c \t%s %c${timeDiffString}`]
      args.push(`color:${ninfo.color}; ${styleBold}`)
      args.push(styleDefault)
      args.push(msg.messages?.[0] ?? '')
      args.push(`color:${ninfo.color};`)
      args.push(...msg.messages.slice(1))
    }
    else {
      args = [name, ...msg.messages, `+${timeDiffString}`]
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

    args = args.map((arg: unknown) => {
      // There is an aweful bug in WKWebView causing "stack" issues on Uint8Arrays >= 64k
      if (arg instanceof Uint8Array)
        return `<Uint8Array size=${arg.length}`
      return arg
    }) as any

    switch (msg.level) {
      case LogLevel.info:
        if (opt.levelHelper)
          args[0] = `I|*   ${args[0]}`
        console.info(...args)
        break
      case LogLevel.warn:
        if (opt.levelHelper)
          args[0] = `W|**  ${args[0]}`
        console.warn(...args)
        break
      case LogLevel.error:
        if (opt.levelHelper)
          args[0] = `E|*** ${args[0]}`
        console.error(...args)
        break
      default:
        if (opt.levelHelper)
          args[0] = `D|    ${args[0]}`
        console.debug(...args)
        break
    }
  }
}

