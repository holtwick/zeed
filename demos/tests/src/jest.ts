import { deepEqual, Logger } from "zeed"
import { Buffer } from "buffer"
import { fn } from "jest-mock"

const log = Logger("jest")

let context: any = {}

let perfomedAssertions = 0
let expectAssertions = -1

export async function describe(title: string, fn: any) {
  log.info(`${title}...`)
  context = {
    fails: 0,
    its: [],
  }

  try {
    let r = fn.call(context)

    if (r?.then) {
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
    log.info(`... ${it.title}`)

    try {
      perfomedAssertions = 0
      expectAssertions = -1

      let r = it.fn.call()

      if (r?.then) {
        await r
      }

      if (expectAssertions >= 0 && perfomedAssertions !== expectAssertions) {
        log.warn(
          `Expected ${expectAssertions} assertions, only got ${perfomedAssertions}`
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
      log.info("OK - Passed Test")
      perfomedAssertions += 1
    } else {
      log.warn(`Fail: got ${actual} expected ${expected}`)
      context.fails += 1
    }
  }

  return {
    toBe: (expected: any) => test(expected === actual, expected),
    toEqual: (expected: any) => test(deepEqual(expected, actual), expected),
    toBeNull: () => test(actual == null, null),
    toBeTruthy: () => test(actual == true, null),
    toBeGreaterThan: (expected: number) => test(expected < actual, expected),
    toContain: (expected: any) => test(actual.includes(expected), expected),

    get not() {
      return {
        toBe: (expected: any) => test(expected !== actual, expected),
        toEqual: (expected: any) =>
          test(!deepEqual(expected, actual), expected),
        toBeNull: () => test(actual != null, null),
        toBeTruthy: () => test(actual != true, null),
        toBeGreaterThan: (expected: number) =>
          test(expected >= actual, expected),
        toContain: (expected: any) =>
          test(!actual.includes(expected), expected),
      }
    },
  }
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

//

import("../../../src/browser/localhost.spec")

import("../../../src/common/array.spec")
import("../../../src/common/basex.spec")
import("../../../src/common/camelcase.spec")

// import("../../../src/common/channel.spec")
import("../../../src/common/convert.spec")
import("../../../src/common/emitter.spec")
