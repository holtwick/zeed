/* eslint-disable ts/consistent-type-definitions */
describe('simple.spec', () => {
  it('should do something', async () => {
    type TypeOptions = {
      optional?: true
    }

    type Type<T = unknown> = {
      _ts?: { _ts: T | undefined }
      type: string
      children?: []
    } & TypeOptions

    function string(opt?: TypeOptions): Type<string> {
      return { ...opt, type: 'string' }
    }

    function number(opt?: TypeOptions): Type<number> {
      return { ...opt, type: 'number' }
    }

    // function number<O>(opt?: O): Type<number, O> {
    //   return { ...opt, type: 'number' }
    // }

    type Infer<T> = T extends Type<infer TT> ? TT : never

    // type Infer<T> = T extends Type<infer TT>
    //   ? (O extends { optional: true } ? TT | undefined : TT)
    //   : never

    // const optional = true

    const age = number({ optional: true })
    type ageType = Infer<typeof age>
    const testAge: ageType = undefined

    const name = string()
    type nameType = Infer<typeof name>

    type testType = Infer<Type<number, { optional: true }>>

    expect(testAge).toBe(undefined)

    //

    type ObjectInput = Record<string, Type>
    type ObjectPretty<V> = Extract<{ [K in keyof V]: V[K] }, unknown>
    type ObjectOutput<T extends ObjectInput> = ObjectPretty<Type<{
      [K in keyof T]: Infer<T[K]>
    }>>

    function object<T extends ObjectInput>(obj: T, opt?: TypeOptions): ObjectOutput<T> {
      return { type: 'object', children: obj as any } as any
    }

    const schema = object({ name, age })

    type Schema = Infer<typeof schema>

    const sample: Schema = {
      name: 'Hello',
      age: 42,
    }

    expect(schema).toMatchInlineSnapshot(`
      Object {
        "children": Object {
          "age": Object {
            "optional": true,
            "type": "number",
          },
          "name": Object {
            "type": "string",
          },
        },
        "type": "object",
      }
    `)
  })
})

type TypeOptions = {
  optional?: true
}

type Type<T = unknown> = {
  _ts?: () => T
  type: string
  children?: []
}

function string(opt?: TypeOptions): Type<string> {
  return { ...opt, type: 'string' }
}

type Infer<T> = T extends Type<infer TT> ? TT : never

const schema = string({ optional: true })

type Schema = Infer<typeof schema> // this should be string | undefined
