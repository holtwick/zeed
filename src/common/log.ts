// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { getGlobalContext } from "./global"
import { LoggerContext, LoggerContextInterface } from "./log-base"
import { LoggerConsoleHandler } from "./log-console"

// Global logger to guarantee all submodules use the same logger instance

let globalLogger: LoggerContextInterface

declare global {
  interface ZeedGlobalContext {
    logger?: any // Should be LoggerContextInterface, but avoid compiler issues this way
  }
}

function getLoggerContext() {
  let logger = LoggerContext()
  logger.setHandlers([LoggerConsoleHandler()])
  return logger
}

export function getGlobalLogger(): LoggerContextInterface {
  if (globalLogger == null) {
    try {
      let gcontext = getGlobalContext()
      if (gcontext != null) {
        if (gcontext?.logger == null) {
          globalLogger = getLoggerContext()
          gcontext.logger = globalLogger
        } else {
          globalLogger = gcontext.logger
        }
      } else {
        globalLogger = getLoggerContext()
      }
    } catch (e) {
      globalLogger = getLoggerContext()
    }
  }
  return globalLogger
}

// todo sideffects
export let Logger = getGlobalLogger()
