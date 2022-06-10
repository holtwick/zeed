// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { LoggerContext, LogLevel, LogMessage } from "./log-base"

describe("Logger", function () {
  test("should log different levels", function () {
    let messages: LogMessage[] = []

    let logger = LoggerContext()

    function LoggerTestHandler(msg: LogMessage) {
      messages.push(msg)
    }

    logger.setHandlers([LoggerTestHandler])

    let log = logger("test")
    let { info, error, warn, debug, assert } = log

    log("Simple") // shortcut
    debug("Hello")
    info("World")
    warn("is on")
    error("Fire")
    assert(false, "Fatal")

    expect(messages).toEqual([
      {
        level: 0,
        messages: ["Simple"],
        name: "test",
      },
      {
        level: 0,
        messages: ["Hello"],
        name: "test",
      },
      {
        level: 1,
        messages: ["World"],
        name: "test",
      },
      {
        level: 2,
        messages: ["is on"],
        name: "test",
      },
      {
        level: 3,
        messages: ["Fire"],
        name: "test",
      },
      {
        level: 2,
        messages: ["Fatal"],
        name: "test",
      },
    ])
  })

  test("should log filter level", function () {
    let messages: LogMessage[] = []
    function LoggerTestHandler(msg: LogMessage) {
      messages.push(msg)
    }

    let logger = LoggerContext()
    logger.setLogLevel(LogLevel.info)
    logger.setHandlers([LoggerTestHandler])

    const log = logger("test")
    let { info, error, warn, debug, assert, label } = log

    expect(label).toBe("test")

    debug("Hello")
    info("World")
    warn("is on")
    error("Fire")
    assert(false, "Fatal")

    expect(messages).toEqual([
      { name: "test", messages: ["World"], level: 1 },
      { name: "test", messages: ["is on"], level: 2 },
      { name: "test", messages: ["Fire"], level: 3 },
      { name: "test", messages: ["Fatal"], level: 2 },
    ])

    {
      let { info, error, warn, debug, assert } = log.extend("ext")
      debug("Hello")
      info("World2")
      warn("is on")
      error("Fire")
      assert(false, "Fatal")

      // console.dir(messages)

      expect(messages).toEqual([
        { name: "test", messages: ["World"], level: 1 },
        { name: "test", messages: ["is on"], level: 2 },
        { name: "test", messages: ["Fire"], level: 3 },
        { name: "test", messages: ["Fatal"], level: 2 },
        { name: "test:ext", messages: ["World2"], level: 1 },
        { name: "test:ext", messages: ["is on"], level: 2 },
        { name: "test:ext", messages: ["Fire"], level: 3 },
        { name: "test:ext", messages: ["Fatal"], level: 2 },
      ])
    }
  })

  test("should log filter namespace", function () {
    let messages: LogMessage[] = []
    function LoggerTestHandler(msg: LogMessage) {
      messages.push(msg)
    }

    let logger = LoggerContext()
    logger.setHandlers([LoggerTestHandler])
    logger.setFilter("a*,-ab")

    let aa = logger("aa")
    let ab = logger("ab")
    let xy = logger("xy")

    aa("aa")
    ab("ab")
    xy("xy")

    expect(messages).toEqual([
      {
        level: 0,
        messages: ["aa"],
        name: "aa",
      },
    ])

    // logger.setFilter("")
    let xyz = aa.extend("xyz")

    xyz("xyz")

    expect(messages).toEqual([
      {
        level: 0,
        messages: ["aa"],
        name: "aa",
      },
      {
        level: 0,
        messages: ["xyz"],
        name: "aa:xyz",
      },
    ])
  })

  test("should fake log", function () {
    let messages: LogMessage[] = []
    let logger = LoggerContext()

    function LoggerTestHandler(msg: LogMessage) {
      messages.push(msg)
    }

    logger.setHandlers([LoggerTestHandler])

    let log = logger("test", false)
    let { info, error, warn, debug, assert } = log

    log("Simple") // shortcut
    debug("Hello")
    info("World")
    warn("is on")
    error("Fire")

    expect(messages).toEqual([])
  })
})
