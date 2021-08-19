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

/**
 * Get the source code location of the caller
 * https://stackoverflow.com/a/47296370/140927
 *
 * @param level Number of levels to go down the stack trace
 * @param stripCwd Strip the current working directory, only reasonable for Node.js environment
 * @returns
 */
export function logSourceLocation(level = 2, stripCwd = true): string {
  let line: string | undefined
  let stack = new Error().stack
  if (typeof stack === "string") {
    let rawLine: string | undefined = stack
      ?.split("\n")
      ?.map((rawLine) => rawLine.match(/^\s+at.*\((.*?)\)/)?.[1])
      ?.filter((v) => v != null)?.[level]
    if (rawLine && stripCwd && rawLine.startsWith(process.cwd())) {
      rawLine = "./" + rawLine.substr(process.cwd().length + 1)
    }
  }
  return line || ""
}
