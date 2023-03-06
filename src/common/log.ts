// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { getGlobalContext } from './global'
import type { LogLevelAliasType, LoggerContextInterface, LoggerInterface } from './log-base'
import { LoggerContext } from './log-base'
import { LoggerConsoleHandler } from './log-console'

// Global logger to guarantee all submodules use the same logger instance

let globalLogger: LoggerContextInterface

declare global {
  interface ZeedGlobalContext {
    logger?: any // Should be LoggerContextInterface, but avoid compiler issues this way
  }
}

function getLoggerContext(setup?: (context: LoggerContextInterface) => void) {
  const logger = LoggerContext()
  if (setup)
    setup(logger)
  else
    logger.setHandlers([LoggerConsoleHandler()])
  return logger
}

export function getGlobalLogger(setup?: (context: LoggerContextInterface) => void): LoggerContextInterface {
  if (globalLogger == null) {
    try {
      const gcontext = getGlobalContext()
      if (gcontext != null) {
        if (gcontext?.logger == null) {
          globalLogger = getLoggerContext(setup)
          gcontext.logger = globalLogger
        }
        else {
          globalLogger = gcontext.logger
        }
      }
      else {
        globalLogger = getLoggerContext(setup)
      }
    }
    catch (e) {
      globalLogger = getLoggerContext(setup)
    }
  }
  return globalLogger
}

export function DefaultLogger(name?: string, level?: LogLevelAliasType): LoggerInterface {
  return getGlobalLogger()(name, level)
}
