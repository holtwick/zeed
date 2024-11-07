import type { LogHandler, LogHandlerOptions, LogMessage } from '../../common/log/log-base'
import { LogLevelError, LogLevelInfo, LogLevelWarn } from '../../common/log/log-base'
import { browserSelectColorByName } from '../../common/log/log-colors'
import { getGlobalConsole } from '../../common/log/log-console-original'
import { useLevelFilter, useNamespaceFilter } from '../../common/log/log-filter'
import { formatMilliseconds, getTimestamp } from '../../common/time'
import { browserSupportsColors } from './log-colors'

export function LoggerBrowserHandler(opt: LogHandlerOptions = {}): LogHandler {
  const styleFont = 'font-family: "JetBrains Mono", Menlo; font-size: 11px;'
  const styleDefault = `${styleFont}`
  const styleBold = `font-weight: 600; ${styleFont}`
  const useColors = browserSupportsColors()
  const namespaces: Record<string, any> = {}
  const startTime = getTimestamp()

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

  // logCaptureConsole will override the console methods, so we need to get the original ones
  const originalConsole = getGlobalConsole()

  if (!originalConsole)
    return () => {}

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
        color: browserSelectColorByName(name),
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
        return `<Uint8Array size=${arg.length}>`
      return arg
    }) as any

    switch (msg.level) {
      case LogLevelInfo:
        if (opt.levelHelper)
          args[0] = `I|*   ${args[0]}`
        originalConsole.info(...args)
        break
      case LogLevelWarn:
        if (opt.levelHelper)
          args[0] = `W|**  ${args[0]}`
        originalConsole.warn(...args)
        break
      case LogLevelError:
        if (opt.levelHelper)
          args[0] = `E|*** ${args[0]}`
        originalConsole.error(...args)
        break
      default:
        if (opt.levelHelper)
          args[0] = `D|    ${args[0]}`
        originalConsole.debug(...args)
        break
    }
  }
}
