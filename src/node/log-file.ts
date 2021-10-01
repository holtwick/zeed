// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { createWriteStream, mkdirSync } from "fs"
import { dirname, resolve } from "path"
import { renderMessages } from "../common/data/convert"
import { LogHandlerOptions, LogLevel, LogMessage } from "../common/log-base"
import { useLevelFilter, useNamespaceFilter } from "../common/log-filter"

let namespaces: Record<string, any> = {}

export function LoggerFileHandler(path: string, opt: LogHandlerOptions = {}) {
  const { level = LogLevel.all, filter = "*" } = opt
  path = resolve(process.cwd(), path)
  mkdirSync(dirname(path), { recursive: true })
  var stream = createWriteStream(path, { flags: "a" })
  // stream.end()
  const matchesNamespace = useNamespaceFilter(filter)
  const matchesLevel = useLevelFilter(level)
  return (msg: LogMessage) => {
    if (!matchesLevel(msg.level)) return
    if (!matchesNamespace(msg.name)) return

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
