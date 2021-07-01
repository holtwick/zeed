import { Logger, sleep } from "../common/index.js"
import { LoggerFileHandler } from "./log-file.js"
import { LoggerNodeHandler } from "./log-node.js"
import { statSync, unlinkSync } from "fs"

describe("Log File", () => {
  it("should write log", async () => {
    const path = __dirname + "/tmp/test.log"
    Logger.setHandlers([LoggerFileHandler(path)])
    const log = Logger("test")
    log("debug")
    log.info("info")
    log.warn("warn")
    log.error("error")
    await sleep(1000)
    expect(statSync(path).size).toBeGreaterThan(100)
    unlinkSync(path)
  })

  it("should color log", async () => {
    Logger.setHandlers([LoggerNodeHandler()])
    const log = Logger("test")
    log("debug")
    log.info("info")
    log.warn("warn")
    log.error("error")
  })
})
