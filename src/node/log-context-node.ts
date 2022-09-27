import { Logger } from "../common/log"
import { toPath } from "./env"
import { LoggerFileHandler } from "./log-file"
import { LoggerNodeHandler } from "./log-node"

function setupLogContextNode() {
  let handlers = [
    LoggerNodeHandler({
      padding: 32,
      nameBrackets: false,
      // levelHelper: false,
    }),
  ]

  let logFilePath = process.env.ZEED_LOG ?? process.env.LOG
  if (logFilePath) {
    handlers.unshift(LoggerFileHandler(toPath(logFilePath)))
  }

  Logger.setHandlers(handlers)
}

// todo sideffects
setupLogContextNode()
