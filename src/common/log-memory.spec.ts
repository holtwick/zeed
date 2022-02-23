import { LoggerContext, LogLevel, LogMessage } from "./log-base"
import { LoggerMemoryHandler } from "./log-memory"

describe("log-memory", () => {
  it("should log into memory", async () => {
    let messages: LogMessage[] = []

    let logger = LoggerContext()
    logger.setHandlers([
      LoggerMemoryHandler({
        level: LogLevel.all,
        filter: "*",
        messages,
      }),
    ])

    let log = logger("test")
    let { info, error, warn, debug, assert } = log

    log("Simple") // shortcut
    debug("Hello")
    info("World")
    warn("is on")
    error("Fire")
    assert(false, "Fatal")

    expect(messages).toMatchInlineSnapshot(`
      [
        {
          "level": 0,
          "messages": [
            "Simple",
          ],
          "name": "test",
        },
        {
          "level": 0,
          "messages": [
            "Hello",
          ],
          "name": "test",
        },
        {
          "level": 1,
          "messages": [
            "World",
          ],
          "name": "test",
        },
        {
          "level": 2,
          "messages": [
            "is on",
          ],
          "name": "test",
        },
        {
          "level": 3,
          "messages": [
            "Fire",
          ],
          "name": "test",
        },
        {
          "level": 2,
          "messages": [
            "Fatal",
          ],
          "name": "test",
        },
      ]
    `)
  })
})
