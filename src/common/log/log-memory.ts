import { getTimestamp } from '../time'
import type { LogHandler, LogHandlerOptions, LogMessage, LogMessageCompact } from './log-base'
import { useLevelFilter, useNamespaceFilter } from './log-filter'

export function logMessageFromCompact(m: LogMessageCompact): LogMessage {
  const [timestamp, level, name, ...messages] = m
  return { timestamp, level, name, messages }
}

/** Collect messages in a list. */
export function LoggerMemoryHandler(
  opt: LogHandlerOptions & {
    compact?: boolean
    messages: LogMessageCompact[] | LogMessage[]
  },
): LogHandler {
  const { level = undefined, filter = undefined, compact = false, messages = [] } = opt
  const matchesNamespace = useNamespaceFilter(filter)
  const matchesLevel = useLevelFilter(level)
  return (msg: LogMessage) => {
    if (!matchesLevel(msg.level))
      return
    if (!matchesNamespace(msg.name))
      return
    msg.timestamp ??= getTimestamp()
    if (compact === true)
      (messages as LogMessageCompact[]).push([msg.timestamp, msg.level, msg.name, ...msg.messages])
    else
      (messages as LogMessage[]).push(msg)
  }
}
