import type { LoggerInterface, LogLevelAliasType } from './log-base'
import { isNumber, isString } from '../data/is'

/**
 * Simple log configuration for use in modular scenarios.
 *
 * `LogConfig` can be of various types:
 *
 * 1. `LoggerInterface`: Just a complete logger howeveryou like it
 * 2. `true`: The default logger on
 * 3. `string`: Logger with name
 * 4. `number`: Logger with level e.g. set to `0` to see all
 *
 * All others turn it off.
 */
export type LogConfig = LoggerInterface | string | number | null | undefined | boolean

/** See LogConfig */
export function _LoggerFromConfig(
  Logger: (name?: string, level?: LogLevelAliasType) => LoggerInterface,
  config: LogConfig,
  name: string,
  level?: LogLevelAliasType,
): LoggerInterface {
  if (config === true)
    return Logger(name, level)
  if (isString(config) && config.length > 0)
    return Logger(config, level)
  if (isNumber(config))
    return Logger(name, config)
  if (typeof config === 'function')
    return config
  return Logger(name, false)
}
