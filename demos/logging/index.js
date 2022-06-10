// Simple demo for node and CommonJS loading

import { Logger, setupEnv } from "zeed"

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

  log("Some binary data", new Uint8Array(1, 2, 3, 99, 100, 101))
}

console.log("Hello World")
console.info("Info")
console.warn("Warning")
console.error("Error")
