import type { LoggerInterface } from './log-base'

const noop: any = () => {}

export function LoggerLazy(...args: any[]): LoggerInterface {
  const log = (() => {}) as LoggerInterface
  log.debug = noop
  log.info = noop
  log.warn = noop
  log.error = noop
  log.assert = noop
  log.fatal = noop
  return log
}
