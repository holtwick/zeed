// Simple demo for node and CommonJS loading

import { Logger, setupEnv } from "zeed"

// Logger.setHandlers([
//   LoggerFileHandler("zeed.log", {
//     level: LogLevel.debug,
//   }),
//   LoggerNodeHandler({
//     colors: true,
//     padding: 16,
//     nameBrackets: false,
//     levelHelper: true,
//   }),
// ])

// Read .env file

setupEnv()

// Some basic logging

{
  const log = Logger("demo")
  log("Hello World")
  log.info("Info")
  log.warn("Warning")
  log.error("Error")

  log.info("DEMO_SECRET =", process.env.DEMO_SECRET)
}

{
  const log = Logger("demo2")
  log("Hello World")
  log.info("Info")
  log.warn("Warning")
  log.error("Error")
}
