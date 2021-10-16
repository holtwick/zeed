import { Buffer } from "buffer"
import { fn } from "jest-mock"
import { deepEqual, isPromise, Logger } from "zeed"

const log = Logger("jest")

let context: any = {}

let perfomedAssertions = 0
let expectAssertions = -1

export async function describe(title: string, fn: any) {
  log(`${title}...`)
  context = {
    fails: 0,
    its: [],
  }

  try {
    let r = fn.call(context)

    if (isPromise(r)) {
      await r
    }
  } catch (err) {
    context.fails += 1
    log.warn("Exception:", err)
  }

  if (context.beforeAll) {
    context.beforeAll()
  }

  for (let it of context.its) {
    log(`... ${it.title}`)

    try {
      perfomedAssertions = 0
      expectAssertions = -1

      var rdone
      var done = (value: any) => log.error("Did not set up done() correctly")
      if (it.fn.length > 0) {
        rdone = new Promise((r) => (done = r))
      }

      let r = it.fn.call(null, done)

      if (rdone || isPromise(r)) {
        log(`      #async`)
      } else if (expectAssertions > 0) {
        log.warn("If expecting assertions, the test should be async.")
      }

      if (expectAssertions > 0) log(`      #expect=${expectAssertions}`)

      if (rdone) await rdone
      if (isPromise(r)) await r

      if (expectAssertions >= 0 && perfomedAssertions !== expectAssertions) {
        log.warn(
          `Expected ${expectAssertions} assertions, got ${perfomedAssertions}. ${title}/${it.title}`
        )
      }
    } catch (err) {
      context.fails += 1
      log.warn("Exception:", err)
    }
  }

  if (context.afterAll) {
    context.afterAll()
  }

  if (context.fails > 0) {
    alert(`${context.fails} tests did fail in ${title}`)
  } else {
    log.info(`All ${context.its.length} tests of ${title} passed!`)
  }
}

export function beforeAll(fn: any) {
  context.beforeAll = fn
}

export function afterAll(fn: any) {
  context.afterAll = fn
}

export function it(title: string, fn: any) {
  context.its.push({
    title,
    fn,
  })
}

function expect(actual: any) {
  function test(ok: boolean, expected: any) {
    if (ok) {
      // log("OK - Passed Test")
      perfomedAssertions += 1
    } else {
      log.warn(`Fail: got ${actual} expected ${expected}`)
      context.fails += 1
    }
  }

  let matchers = {
    toBe: (expected: any) => expected === actual,
    toEqual: (expected: any) => deepEqual(expected, actual),
    toBeNull: () => actual == null,
    toBeTruthy: () => actual == true,
    toBeGreaterThan: (expected: number) => expected < actual,
    toBeLessThan: (expected: number) => expected > actual,
    toContain: (expected: any) => actual.includes(expected),
    toHaveLength: (expected: any) => actual.length === expected,
    // toMatchInlineSnapshot:
  }

  let obj: any = {
    not: {},
  }

  for (const [key, value] of Object.entries(matchers)) {
    obj[key] = (expected: any) => {
      test(value(expected), expected)
    }
    obj.not[key] = (expected: any) => {
      test(!value(expected), expected)
    }
  }

  return obj

  // return {
  //   toBe: (expected: any) => test(expected !== actual, expected),
  //   toEqual: (expected: any) =>
  //     test(!deepEqual(expected, actual), expected),
  //   toBeNull: () => test(actual != null, null),
  //   toBeTruthy: () => test(actual != true, null),
  //   toBeGreaterThan: (expected: number) =>
  //     test(expected >= actual, expected),
  //   toBeLessThan: (expected: number) => test(expected <= actual, expected),
  //   toContain: (expected: any) =>
  //     test(!actual.includes(expected), expected),
  //   toHaveLength: (expected: any) =>
  //     test(actual.length !== expected, expected),
  // }
}

expect.assertions = (count: number) => (expectAssertions = count)

// @ts-ignore
Object.assign(window, {
  expect,
  it,
  test: it,
  beforeAll,
  afterAll,
  describe,
  Buffer,
  jest: { fn },
})

// Actual tests

import("../../../src/common/localhost.spec")

import("../../../src/common/data/array.spec")
import("../../../src/common/data/basex.spec")
import("../../../src/common/data/camelcase.spec")
import("../../../src/common/msg/channel.spec")
import("../../../src/common/data/convert.spec")
// import("../../../src/common/emitter.spec")
import("../../../src/common/log-filter.spec")
// import("../../../src/common/log-util.spec")
import("../../../src/common/log.spec")
import("../../../src/common/msg/mq.spec")
import("../../../src/common/mutex.spec")
import("../../../src/common/data/orderby.spec")
// import("../../../src/common/platform.spec")
import("../../../src/common/promises.spec")
import("../../../src/common/queue.spec")
import("../../../src/common/data/sortable.spec")
import("../../../src/common/data/utils.spec")
import("../../../src/common/uuid.spec")

// describe("Stack", () => {
//   it("should find correct line", () => {
//     const line = getSourceLocation(0)
//     log("stack", new Error().stack)
//     expect(line).toBe("")
//   })
// })
