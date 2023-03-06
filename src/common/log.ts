// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { getGlobalContext } from './global'
import type { LoggerContextInterface } from './log-base'
import { LoggerContext } from './log-base'
import { LoggerConsoleHandler } from './log-console'

// Global logger to guarantee all submodules use the same logger instance

let globalLogger: LoggerContextInterface

declare global {
  interface ZeedGlobalContext {
    logger?: any // Should be LoggerContextInterface, but avoid compiler issues this way
  }
}

function getLoggerContext() {
  const logger = LoggerContext()
  logger.setHandlers([LoggerConsoleHandler()])
  return logger
}

export function getGlobalLogger(): LoggerContextInterface {
  if (globalLogger == null) {
    try {
      const gcontext = getGlobalContext()
      if (gcontext != null) {
        if (gcontext?.logger == null) {
          globalLogger = getLoggerContext()
          gcontext.logger = globalLogger
        }
        else {
          globalLogger = gcontext.logger
        }
      }
      else {
        globalLogger = getLoggerContext()
      }
    }
    catch (e) {
      globalLogger = getLoggerContext()
    }
  }
  return globalLogger
}

// todo sideeffects
export const Logger = getGlobalLogger()

// export function Logger(...args: any[]): LoggerInterface {
//   return getGlobalLogger()(...args)
// }
