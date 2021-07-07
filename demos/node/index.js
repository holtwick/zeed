// Simple demo for node and CommonJS loading

import { Logger, setupEnv } from "zeed"

// Some basic logging

const log = Logger("demo")
log("Hello World")
log.info("Info")
log.warn("Warning")
log.error("Error")

// Read .env file

setupEnv()

log.info("DEMO_SECRET =", process.env.DEMO_SECRET)
