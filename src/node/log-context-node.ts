import { valueToBoolean } from '../common'
import { Logger } from '../common/log'
import { toPath } from './env'
import { LoggerFileHandler } from './log-file'
import { LoggerNodeHandler } from './log-node'

function setupLogContextNode() {
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
  if (logFilePath)
    handlers.unshift(LoggerFileHandler(toPath(logFilePath), { time, pretty }))

  Logger.setHandlers(handlers)
}

// todo sideffects
setupLogContextNode()
