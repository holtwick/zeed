import type { LoggerInterface, LogLevelAliasType } from '../../common/log/log-base'
import type { LogConfig } from '../../common/log/log-config'
import type { LogRotationOptions } from './log-file'
import process from 'node:process'
import { valueToBoolean } from '../../common/data/convert'
import { getGlobalLogger } from '../../common/log/log'
import { _LoggerFromConfig } from '../../common/log/log-config'
import { toPath } from '../env'
import { LoggerFileHandler } from './log-file'
import { LoggerNodeHandler } from './log-node'

function parseRotateEnv(v?: string | null): LogRotationOptions {
  if (['daily', 'weekly', 'monthly', 'size'].includes(String(v).trim().toLowerCase())) {
    return v as 'daily' | 'weekly' | 'monthly' | 'size'
  }

  return valueToBoolean(v, false)
}

export function Logger(name?: string, level?: LogLevelAliasType): LoggerInterface {
  return getGlobalLogger((context) => {
    const handlers = [
      LoggerNodeHandler({
        padding: 32,
        nameBrackets: false,
        // levelHelper: false,
      }),
    ]

    const logFilePath = process.env.ZEED_LOG ?? process.env.LOG
    const time = valueToBoolean(process.env.ZEED_TIME, true)
    const pretty = valueToBoolean(process.env.ZEED_PRETTY, false)
    const rotation = parseRotateEnv(process.env.ZEED_ROTATE)
    if (logFilePath)
      handlers.unshift(LoggerFileHandler(toPath(logFilePath), { time, pretty, rotation }))

    context.setHandlers(handlers)
  })(name, level)
}

/** See LogConfig */
export function LoggerFromConfig(config: LogConfig, name: string, level?: LogLevelAliasType): LoggerInterface {
  return _LoggerFromConfig(Logger, config, name, level)
}
