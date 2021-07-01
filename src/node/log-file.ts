import { createWriteStream, mkdirSync } from "fs"
import { resolve, dirname } from "path"
import { renderMessages } from "../common/convert.js"
import { LogLevel, LogMessage } from "../common/log.js"

let namespaces: Record<string, any> = {}

export function LoggerFileHandler(
  path: string,
  level: LogLevel = LogLevel.debug
) {
  path = resolve(process.cwd(), path)
  mkdirSync(dirname(path), { recursive: true })
  var stream = createWriteStream(path, { flags: "a" })
  // stream.end()
  return (msg: LogMessage) => {
    if (msg.level < level) return

    const time = new Date().toISOString()
    let name = msg.name || ""
    let ninfo = namespaces[name || ""]
    if (ninfo == null) {
      namespaces[name] = ninfo
    }

    let args: string[] = [
      `[${name || "*"}]`,
      renderMessages(msg.messages, { pretty: false }),
    ]

    function write(...args: string[]): void {
      stream.write(args.join("\t") + "\n")
    }

    switch (msg.level) {
      case LogLevel.info:
        write(time, `I|*  `, ...args)
        break
      case LogLevel.warn:
        write(time, `W|** `, ...args)
        break
      case LogLevel.error:
        write(time, `E|***`, ...args)
        break
      default:
        write(time, `D|   `, ...args)
        break
    }
  }
}
