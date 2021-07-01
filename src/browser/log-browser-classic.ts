import { getTimestamp, formatMilliseconds } from "../common/time"
import { LogHandler, LogLevel, LogMessage } from "../common/log"
import { selectColor, supportsColors } from "./colors"

let namespaces: Record<string, any> = {}

let time = getTimestamp()

const useColors = supportsColors()

export function LoggerBrowserClassicHandler(
  level: LogLevel = LogLevel.debug,
  opt: {
    colors: boolean
    levelHelper: boolean
    nameBrackets: boolean
  } = {
    colors: true,
    levelHelper: false,
    nameBrackets: true,
  }
): LogHandler {
  return (msg: LogMessage) => {
    if (msg.level < level) return

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
    if (opt.colors && useColors) {
      args = opt.nameBrackets ? [`%c[${name}]`] : [`%c${name}`]
      args.push(`color:${ninfo.color}`)
      args.push(...msg.messages)
    } else {
      args = [name, ...msg.messages]
    }
    args.push(`+${diff}`)
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
