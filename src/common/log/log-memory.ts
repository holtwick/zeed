import type { LogHandler, LogHandlerOptions, LogMessage, LogMessageCompact } from './log-base'
import { objectPlain } from '../data/object'
import { getTimestamp } from '../time'
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
    errorTrace?: boolean
    limit?: number
    maxDepth?: number
    keepAsIs?: (v: any) => boolean
  },
): LogHandler {
  const { level = undefined, filter = undefined, compact = false, messages = [], errorTrace = false, maxDepth = 20, keepAsIs } = opt
  const matchesNamespace = useNamespaceFilter(filter)
  const matchesLevel = useLevelFilter(level)

  let counter = opt.limit ?? Number.POSITIVE_INFINITY

  return (msg: LogMessage) => {
    if (!matchesLevel(msg.level))
      return
    if (!matchesNamespace(msg.name))
      return

    msg.timestamp ??= getTimestamp()

    const m = objectPlain(msg, {
      maxDepth,
      errorTrace,
      keepAsIs, // : v => (v instanceof Error) || (typeof ErrorEvent !== 'undefined' && v instanceof ErrorEvent),
    })

    if (compact === true)
      (messages as LogMessageCompact[]).push([m.timestamp, m.level, m.name, ...m.messages])
    else
      (messages as LogMessage[]).push(m)

    if (counter <= 0)
      messages.shift()
    else
      --counter
  }
}
