// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import jsonParse, { jsonStringify } from "./json"

describe("convert", () => {
  it("should jsonStringify", () => {
    var circularObj = {}
    // @ts-ignore
    circularObj.circularRef = circularObj
    // @ts-ignore
    circularObj.list = [circularObj, circularObj]
    expect(jsonStringify(circularObj)).toBe(
      '{"circularRef":"[Circular ~]","list":["[Circular ~]","[Circular ~]"]}'
    )
  })

  it("should jsonParse", () => {
    const input = '{ "user": { "__proto__": { "isAdmin": true } } }'
    expect(jsonParse(input)).toEqual({ user: {} })
  })
})
