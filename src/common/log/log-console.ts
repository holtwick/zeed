import type { LogHandler, LogHandlerOptions, LogMessage } from './log-base'
import { LogLevelError, LogLevelInfo, LogLevelWarn } from './log-base'
import { getGlobalConsole } from './log-console-original'
import { joinLogStrings, useLevelFilter, useNamespaceFilter } from './log-filter'

/**
 * Very basic logger. Please take a look at the browser and node
 * optimized loggers. This one is just the absolute fallback option.
 */
export function LoggerConsoleHandler(opt: LogHandlerOptions = {}): LogHandler {
  const {
    level = undefined,
    filter = undefined,
    // colors = true,
    // levelHelper = false,
    // nameBrackets = true,
    // padding = 16,
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
    const name = msg.name ? `[${msg.name}]` : ''
    switch (msg.level) {
      case LogLevelInfo:
        originalConsole.info(...joinLogStrings(`I|*   ${name}`, ...msg.messages))
        break
      case LogLevelWarn:
        originalConsole.warn(...joinLogStrings(`W|**  ${name}`, ...msg.messages))
        break
      case LogLevelError:
        originalConsole.error(...joinLogStrings(`E|*** ${name}`, ...msg.messages))
        break
      default:
        originalConsole.debug(...joinLogStrings(`D|    ${name}`, ...msg.messages))
        break
    }
  }
}
