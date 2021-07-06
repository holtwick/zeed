import { LogHandler, LogLevel, LogMessage } from "../common/log.js"
import { getTimestamp, formatMilliseconds } from "../common/time.js"
import tty from "tty"
import { useNamespaceFilter } from "../common/log-filter.js"

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
  return process.stderr.write(args.join(" ") + "\n")
}

export function LoggerNodeHandler(
  level: LogLevel = LogLevel.debug,
  opt: {
    colors: boolean
    levelHelper: boolean
    nameBrackets: boolean
    padding: number
    // paddingRight: number
  } = {
    colors: true,
    levelHelper: true,
    nameBrackets: false,
    padding: 16,
    // paddingLeft: 16,
  }
): LogHandler {
  const matches = useNamespaceFilter(process.env.DEBUG)
  return (msg: LogMessage) => {
    if (msg.level < level) return
    if (!matches(msg.name)) return

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

    let displayName = opt.nameBrackets ? `[${name}]` : name

    if (opt.padding > 0) {
      displayName = displayName.padStart(opt.padding, " ")
      // displayName = displayName.padEnd(opt.padding, " ")
    }

    if (opt.colors && useColors) {
      const c = ninfo.color
      const colorCode = "\u001B[3" + (c < 8 ? c : "8;5;" + c) + "m" // ";1m "
      args = [`${colorCode}${displayName}\u001B[0m | `] // opt.nameBrackets ? [`%c[${name}]`] : [`%c${name}`]
      args.push(...msg.messages)
      args.push(`${colorCode}+${diff}\u001B[0m`)
    } else {
      args = [displayName, ...msg.messages]
      args.push(`+${diff}`)
    }
    switch (msg.level) {
      case LogLevel.info:
        if (opt.levelHelper) args[0] = `I|*   ` + args[0]
        log(...args)
        break
      case LogLevel.warn:
        if (opt.levelHelper) args[0] = `W|**  ` + args[0]
        log(...args)
        break
      case LogLevel.error:
        if (opt.levelHelper) args[0] = `E|*** ` + args[0]
        log(...args)
        break
      default:
        if (opt.levelHelper) args[0] = `D|    ` + args[0]
        log(...args)
        break
    }
  }
}
