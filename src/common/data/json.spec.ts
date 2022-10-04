// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import jsonParse, { jsonStringifySafe, jsonStringifySorted } from './json'

describe('convert', () => {
  it('should jsonStringify', () => {
    const circularObj = {}
    // @ts-expect-error
    circularObj.circularRef = circularObj
    // @ts-expect-error
    circularObj.list = [circularObj, circularObj]
    expect(jsonStringifySafe(circularObj)).toBe(
      '{"circularRef":"[Circular ~]","list":["[Circular ~]","[Circular ~]"]}',
    )
  })

  it('should jsonParse', () => {
    const input = '{ "user": { "__proto__": { "isAdmin": true } } }'
    expect(jsonParse(input)).toEqual({ user: {} })
  })

  it('should sort', () => {
    const a = jsonStringifySorted({ a: 1, b: 2 })
    const b = jsonStringifySorted({ b: 2, a: 1 })
    expect(a).toEqual(b)
  })

  it('should sort and safe', () => {
    const a = jsonStringifySafe({ a: 1, b: 2 })
    const b = jsonStringifySafe({ b: 2, a: 1 })
    expect(a).toEqual(b)
  })
})
