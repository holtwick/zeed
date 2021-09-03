// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { isBrowser } from "./platform"
import {
  LoggerBrowserHandler,
  LoggerBrowserSetupDebugFactory,
} from "../browser/log-browser"
import { getGlobalContext } from "./global"
import { LoggerContext, LoggerContextInterface } from "./log-base"

// Global logger to guarantee all submodules use the same logger instance

let globalLogger: LoggerContextInterface

declare global {
  interface ZeedGlobalContext {
    logger?: LoggerContextInterface
  }
}

function getLoggerContext() {
  let logger = LoggerContext()
  if (isBrowser()) {
    logger.setHandlers([LoggerBrowserHandler()]) // Fallback for previously registered Loggers
    logger.setFactory(LoggerBrowserSetupDebugFactory({}))
  }
  return logger
}

try {
  let _global = getGlobalContext()
  if (_global != null) {
    if (_global?.logger == null) {
      globalLogger = getLoggerContext()
      _global.logger = globalLogger
    } else {
      globalLogger = _global.logger
    }
  } else {
    globalLogger = getLoggerContext()
  }
} catch (e) {
  globalLogger = getLoggerContext()
}

// /** @deprecated Use `Logger` instead, it is global as well */
// export const GlobalLogger = globalLogger

export const Logger = globalLogger
