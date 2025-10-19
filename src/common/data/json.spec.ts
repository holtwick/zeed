import { jsonParse, jsonStringifySafe, jsonStringifySorted } from './json'

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
    expect(jsonStringifySafe(t)).toMatchInlineSnapshot(`"{"id":{"0":1,"1":2,"2":3}}"`)
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


  it('parses object string', () => {
    expect(jsonParse('{"a": 5, "b": 6}')).toEqual({ a: 5, b: 6 })
  })

  it('parses null string', () => {
    expect(jsonParse('null')).toEqual(null)
  })

  it('parses zero string', () => {
    expect(jsonParse('0')).toEqual(0)
  })

  it('parses string string', () => {
    expect(jsonParse('"x"')).toEqual('x')
  })
 

  it('ignores proto value', () => {
    expect(jsonParse('{"a": 5, "b": "__proto__"}')).toEqual({ a: 5, b: '__proto__' })
  })

  it('errors on proto property', () => {
    expect(jsonParse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }')).toMatchInlineSnapshot(`
      Object {
        "a": 5,
        "b": 6,
      }
    `)
    expect(jsonParse('{ "a": 5, "b": 6, "__proto__" : { "x": 7 } }')).toMatchInlineSnapshot(`
      Object {
        "a": 5,
        "b": 6,
      }
    `)
    expect(jsonParse('{ "a": 5, "b": 6, "__proto__" \n\r\t : { "x": 7 } }')).toMatchInlineSnapshot(`
      Object {
        "a": 5,
        "b": 6,
      }
    `)
    expect(jsonParse('{ "a": 5, "b": 6, "__proto__" \n \r \t : { "x": 7 } }')).toMatchInlineSnapshot(`
      Object {
        "a": 5,
        "b": 6,
      }
    `)
  })
 

  it('errors on proto property (unicode)', () => {
    expect(jsonParse('{ "a": 5, "b": 6, "\\u005f_proto__": { "x": 7 } }')).toMatchInlineSnapshot(`
      Object {
        "a": 5,
        "b": 6,
      }
    `)
    expect(jsonParse('{ "a": 5, "b": 6, "_\\u005fp\\u0072oto__": { "x": 7 } }')).toMatchInlineSnapshot(`
      Object {
        "a": 5,
        "b": 6,
      }
    `)
    expect(jsonParse('{ "a": 5, "b": 6, "\\u005f\\u005f\\u0070\\u0072\\u006f\\u0074\\u006f\\u005f\\u005f": { "x": 7 } }')).toMatchInlineSnapshot(`
      Object {
        "a": 5,
        "b": 6,
      }
    `)
    expect(jsonParse('{ "a": 5, "b": 6, "\\u005F_proto__": { "x": 7 } }')).toMatchInlineSnapshot(`
      Object {
        "a": 5,
        "b": 6,
      }
    `)
    expect(jsonParse('{ "a": 5, "b": 6, "_\\u005Fp\\u0072oto__": { "x": 7 } }')).toMatchInlineSnapshot(`
      Object {
        "a": 5,
        "b": 6,
      }
    `)
    expect(jsonParse('{ "a": 5, "b": 6, "\\u005F\\u005F\\u0070\\u0072\\u006F\\u0074\\u006F\\u005F\\u005F": { "x": 7 } }')).toMatchInlineSnapshot(`
      Object {
        "a": 5,
        "b": 6,
      }
    `)
  })

  it('parses object string', () => {
    expect(jsonParse('{"a": 5, "b": 6}')).toEqual({ a: 5, b: 6 })
  })
 
})
