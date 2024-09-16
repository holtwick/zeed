/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable eqeqeq */

import { fn } from 'jest-mock'
import { format } from 'pretty-format'
import { deepEqual, isPromise, Logger } from '../../../src/index.browser'

const log = Logger('zeed:jest')

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
    const r = fn.call(context)

    if (isPromise(r))
      await r
  }
  catch (err) {
    context.fails += 1
    log.warn('Exception:', err)
  }

  if (context.beforeAll)
    context.beforeAll()

  for (const it of context.its) {
    log(`... ${it.title}`)

    try {
      perfomedAssertions = 0
      expectAssertions = -1

      let rdone
      let done = (_value: any) => log.error('Did not set up done() correctly')
      if (it.fn.length > 0)
        rdone = new Promise(resolve => (done = resolve))

      const r = it.fn.call(null, done)

      if (rdone || isPromise(r))
        log('      #async')
      else if (expectAssertions > 0)
        log.warn('If expecting assertions, the test should be async.')

      if (expectAssertions > 0)
        log(`      #expect=${expectAssertions}`)

      if (rdone)
        await rdone
      if (isPromise(r))
        await r

      if (expectAssertions >= 0 && perfomedAssertions !== expectAssertions) {
        log.warn(`Expected ${expectAssertions} assertions, got ${perfomedAssertions}. ${title}/${it.title}`)
      }
    }
    catch (err) {
      context.fails += 1
      log.warn('Exception:', err)
    }
  }

  if (context.afterAll)
    context.afterAll()

  if (context.fails > 0)
    alert(`${context.fails} tests did fail in ${title}`)
  else
    log.info(`All ${context.its.length} tests of ${title} passed!`)
}

describe.skip = function () {}

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

// test.todo = function () {
//   /* just skip */
// }

describe.todo = function () {
  /* just skip */
}

// describe.only = function () {
//   /* just skip */
// }

it.todo = function () {
  /* just skip */
}

function formatPretty(s: any) {
  return format(s).trim()
}

function expect(actual: any) {
  function test(ok: boolean, expected: any) {
    if (ok) {
      // log("OK - Passed Test")
      perfomedAssertions += 1
    }
    else {
      log.warn(`Fail: got\n${actual}\nexpected\n${expected}`)
      context.fails += 1
    }
  }

  const matchers = {
    toBe: (expected: any) => expected === actual,
    toEqual: (expected: any) => deepEqual(expected, actual), // formatPretty(expected) === formatPretty(actual),
    toBeNull: () => actual == null,
    toBeTruthy: () => actual == true,
    toBeFalsy: () => actual == false,
    toBeGreaterThan: (expected: number) => expected < actual,
    toBeLessThan: (expected: number) => expected > actual,
    toContain: (expected: any) => actual.includes(expected),
    toHaveLength: (expected: any) => actual.length === expected,
    toMatchInlineSnapshot: (expected: string) => {
      const actualPretty = formatPretty(actual)
      let extectedPretty = expected
      const lines = expected.split(/\n/)
      if (lines.length > 1) {
        const padding = lines[1].length - lines[1].trimStart().length
        extectedPretty = lines
          .map(l => l.substring(padding))
          .join('\n')
          .trim()
      }
      const cmpActualPretty = actualPretty
        .trim()
        .split('\n')
        .map(l => l.trim())
        .join('\n')
      const cmpExpectedPretty = extectedPretty
        .trim()
        .split('\n')
        .map(l => l.trim())
        .join('\n')
      return cmpActualPretty === cmpExpectedPretty
    },
  }

  const obj: any = {
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

Object.assign(window, {
  expect,
  it,
  test: it,
  beforeAll,
  afterAll,
  describe,
  // Buffer,
  jest: { fn },
})

// Actual tests

// import("../../../src/common/localhost.spec")

// import("../../../src/common/data/array.spec")
// import("../../../src/common/data/basex.spec")
// import("../../../src/common/data/bin.spec")
// import("../../../src/common/data/camelcase.spec")
// import("../../../src/common/data/day.spec")
// import("../../../src/common/data/decimal.spec")
// import("../../../src/common/data/deep.spec")
// import("../../../src/common/data/is.spec")
// import("../../../src/common/data/json.spec")
// import("../../../src/common/data/list.spec")
// import("../../../src/common/data/math.spec")
// import("../../../src/common/data/object.spec")
// import("../../../src/common/data/rounding.spec")
// import("../../../src/common/data/sortable.spec")
// import("../../../src/common/data/url.spec")
// import("../../../src/common/data/utils.spec")
// import("../../../src/common/data/xrx.spec")

// // import("../../../src/common/msg/channel.spec")
// // import("../../../src/common/data/convert.spec")
// // // import("../../../src/common/emitter.spec")
// // import("../../../src/common/log-filter.spec")
// // // import("../../../src/common/log-util.spec")
// // import("../../../src/common/log.spec")
// // // import("../../../src/common/msg/mq.spec")
// // import("../../../src/common/exec/mutex.spec")
// // import("../../../src/common/data/orderby.spec")
// // // import("../../../src/common/platform.spec")
// // // import("../../../src/common/promises.spec")
// // // import("../../../src/common/queue.spec")
// // import("../../../src/common/data/sortable.spec")
// // import("../../../src/common/data/utils.spec")
// // import("../../../src/common/uuid.spec")

// // describe("Stack", () => {
// //   it("should find correct line", () => {
// //     const line = getSourceLocation(0)
// //     log("stack", new Error().stack)
// //     expect(line).toBe("")
// //   })
// // })

setTimeout(async () => {
  console.log('load all')
  await import('./test-unit-all')
}, 50)

// import("../../../src/common/platform.spec")
