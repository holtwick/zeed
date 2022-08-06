// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import jsonParse, { jsonStringifySafe, jsonStringifySorted } from "./json"

describe("convert", () => {
  it("should jsonStringify", () => {
    var circularObj = {}
    // @ts-ignore
    circularObj.circularRef = circularObj
    // @ts-ignore
    circularObj.list = [circularObj, circularObj]
    expect(jsonStringifySafe(circularObj)).toBe(
      '{"circularRef":"[Circular ~]","list":["[Circular ~]","[Circular ~]"]}'
    )
  })

  it("should jsonParse", () => {
    const input = '{ "user": { "__proto__": { "isAdmin": true } } }'
    expect(jsonParse(input)).toEqual({ user: {} })
  })

  it("should sort", () => {
    let a = jsonStringifySorted({ a: 1, b: 2 })
    let b = jsonStringifySorted({ b: 2, a: 1 })
    expect(a).toEqual(b)
  })

  it("should sort and safe", () => {
    let a = jsonStringifySafe({ a: 1, b: 2 })
    let b = jsonStringifySafe({ b: 2, a: 1 })
    expect(a).toEqual(b)
  })
})
