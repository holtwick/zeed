// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { LogLevel, LogHandler, LogMessage, LogHandlerOptions } from "./log.js"

/**
 * Very basic logger. Please take a look at the browser and node
 * optimized loggers. This one is just the absolute fallback option.
 *
 * @param level Log level
 * @returns Logger
 */
export function LoggerConsoleHandler(opt: LogHandlerOptions = {}): LogHandler {
  const {
    level = LogLevel.all,
    colors = true,
    levelHelper = false,
    nameBrackets = true,
    padding = 16,
    filter = undefined,
  } = opt
  return (msg: LogMessage) => {
    if (msg.level < level) return
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
