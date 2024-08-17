/* eslint-disable ts/consistent-type-definitions */
describe('simple.spec', () => {
  it('should do something', async () => {
    type TypeOptions = {
      optional?: true
    }

    type Type<T = unknown, O = TypeOptions> = {
      _ts?: () => O extends { optional: true } ? T | undefined : T
      type: string
      children?: []
    } & TypeOptions

    function string(opt?: TypeOptions): Type<string> {
      return { ...opt, type: 'string' }
    }

    function number<O >(opt?: O): Type<number, O> {
      return { ...opt, type: 'number' }
    }

    // type Infer<T> = T extends Type<infer TT> ? TT : never

    type Infer<T> = T extends Type<infer TT, infer O>
      ? (O extends { optional: true } ? TT | undefined : TT)
      : never

    type ObjectInput = Record<string, Type>
    type ObjectPretty<V> = Extract<{ [K in keyof V]: V[K] }, unknown>
    type ObjectOutput<T extends ObjectInput> = ObjectPretty<Type<{
      [K in keyof T]: Infer<T[K]>
    }>>

    function object<T extends ObjectInput>(obj: T, opt?: TypeOptions): ObjectOutput<T> {
      return { type: 'object', children: obj as any } as any
    }

    // const optional = true

    const age = number({ optional: true })

    expect(age).toMatchInlineSnapshot(`
      Object {
        "optional": true,
        "type": "number",
      }
    `)

    type ageType = Infer<typeof age>

    const testAge: ageType = undefined

    expect(testAge).toBe(undefined)

    const schema = object({
      name: string(),
      age,
    })

    type Schema = Infer<typeof schema>

    const sample: Schema = {
      name: 'Hello',
      age: '42',
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

const schema = string({optional: true})

type Schema = Infer<typeof schema> // this should be string | undefined

