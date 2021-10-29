// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { LogHandler, LogHandlerOptions, LogLevel, LogMessage } from "./log-base"
import { useLevelFilter, useNamespaceFilter } from "./log-filter"

/**
 * Very basic logger. Please take a look at the browser and node
 * optimized loggers. This one is just the absolute fallback option.
 *
 * @param level Log level
 * @returns Logger
 */
export function LoggerConsoleHandler(opt: LogHandlerOptions = {}): LogHandler {
  const {
    level = LogLevel.info,
    filter = undefined,
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
    let name = msg.name ? `[${msg.name}]` : ""
    switch (msg.level) {
      case LogLevel.info:
        console.info(`I|*   ${name}`, ...msg.messages)
        break
      case LogLevel.warn:
        console.warn(`W|**  ${name}`, ...msg.messages)
        break
      case LogLevel.error:
        console.error(`E|*** ${name}`, ...msg.messages)
        break
      default:
        console.debug(`D|    ${name}`, ...msg.messages)
        break
    }
  }
}
