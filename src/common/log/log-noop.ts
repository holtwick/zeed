import type { LoggerInterface } from './log-base'

export function LoggerHandlerNoop(): LoggerInterface {
  const noop: any = () => {}
  const log = (() => {}) as LoggerInterface
  log.debug = noop
  log.info = noop
  log.warn = noop
  log.error = noop
  log.assert = noop
  log.fatal = noop
  return log
}
