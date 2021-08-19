// Simple demo for node and CommonJS loading

import {
  Logger,
  LoggerFileHandler,
  LoggerNodeHandler,
  LogLevel,
  setupEnv,
} from "zeed"

Logger.setHandlers([
  LoggerFileHandler("zeed.log", {
    level: LogLevel.debug,
  }),
  LoggerNodeHandler({
    // level: LogLevel.info,
    filter: "*",
    colors: true,
    padding: 16,
    nameBrackets: false,
    levelHelper: false,
  }),
])

// Some basic logging

const log = Logger("demo")
log("Hello World")
log.info("Info")
log.warn("Warning")
log.error("Error")

// Read .env file

setupEnv()

log.info("DEMO_SECRET =", process.env.DEMO_SECRET)
