// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { getTimestamp } from '../time'
import type { LogHandler, LogHandlerOptions, LogMessage } from './log-base'
import { useLevelFilter, useNamespaceFilter } from './log-filter'

/**
 * Collect messages in a list.
 *
 * @param level Log level
 * @returns Logger
 */
export function LoggerMemoryHandler(
  opt: LogHandlerOptions & {
    messages: LogMessage[]
  },
): LogHandler {
  const { level = undefined, filter = undefined, messages = [] } = opt
  const matchesNamespace = useNamespaceFilter(filter)
  const matchesLevel = useLevelFilter(level)
  return (msg: LogMessage) => {
    if (!matchesLevel(msg.level))
      return
    if (!matchesNamespace(msg.name))
      return
    msg.timestamp = getTimestamp()
    messages.push(msg)
  }
}
