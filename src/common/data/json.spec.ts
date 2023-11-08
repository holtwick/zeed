// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import jsonParse, { jsonStringifySafe, jsonStringifySorted } from './json'

describe('convert', () => {
  it('should jsonStringify', () => {
    const circularObj = {}
    // @ts-expect-error xxx
    circularObj.circularRef = circularObj
    // @ts-expect-error xxx
    circularObj.list = [circularObj, circularObj]
    expect(jsonStringifySafe(circularObj)).toBe(
      '{"circularRef":"[Circular ~]","list":["[Circular ~]","[Circular ~]"]}',
    )
  })

  it('should jsonStringify class', () => {
    class TestBase { }
    class Test extends TestBase {
      id: any
      constructor(databaseID: any) {
        super()
        this.id = databaseID
      }
    }
    const t = new Test(new Uint8Array([1, 2, 3]))
    expect(jsonStringifySafe(t)).toMatchInlineSnapshot('"{\\"id\\":{\\"0\\":1,\\"1\\":2,\\"2\\":3}}"')
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
    const b = JSON.stringify({ a: 1, b: 2 }) // jsonStringifySafe({ b: 2, a: 1 })
    expect(a).toEqual(b)
  })
})
