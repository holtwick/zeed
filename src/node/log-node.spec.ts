// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger, LogLevel, sleep } from "../common"
import { LoggerFileHandler } from "./log-file"
import { LoggerNodeHandler } from "./log-node"
import { rmSync, statSync, unlinkSync } from "fs"

describe("log-node", () => {
  it("should color log", async () => {
    Logger.setHandlers([LoggerNodeHandler()])
    const log = Logger("test")
    log("debug")
    log.info("info")
    log.warn("warn")
    log.error("error")
  })

  // test("should find pattern", function () {
  //   Logger.setHandlers([
  //     LoggerNodeHandler({
  //       level: LogLevel.all,
  //       filter: "*",
  //       stack: true,
  //     }),
  //   ])
  //   const log = Logger("stack")
  //   log.info("find line")
  // })
})
