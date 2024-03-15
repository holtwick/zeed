import { getGlobalContext } from '../global'
import type { LogLevelAliasType, LoggerContextInterface, LoggerInterface } from './log-base'
import { LoggerConsoleHandler } from './log-console'
import { getGlobalConsole } from './log-console-original'
import { LoggerContext } from './log-context'

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

/** Get or create global logger instance */
export function getGlobalLogger(setup?: (context: LoggerContextInterface) => void): LoggerContextInterface {
  if (globalLogger == null) {
    try {
      const gcontext = getGlobalContext()
      if (gcontext != null) {
        getGlobalConsole()

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

/** Can be used for lazy usage e.g. inside of Zeed  */
export function getGlobalLoggerIfExists() {
  if (globalLogger != null)
    return globalLogger

  try {
    const gcontext = getGlobalContext()
    if (gcontext?.logger != null)
      return gcontext.logger
  }
  catch (e) { }
}

export function DefaultLogger(name?: string, level?: LogLevelAliasType): LoggerInterface {
  return getGlobalLogger()(name, level)
}
