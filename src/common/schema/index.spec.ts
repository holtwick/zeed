/* eslint-disable ts/consistent-type-definitions */
describe('simple.spec', () => {
  it('should do something', async () => {
    type TypeOptions = {
      optional?: boolean
    }

    type TypeProps = {
      type: string
      children?: []
    }

    type Type<T = unknown> = {
      _ts: T
    } & TypeOptions & TypeProps

    const mixin = { _ts: null as any }

    function generic<T>(opt?: TypeOptions) {
      const data = { ...mixin, ...opt, type: 'string' }
      if (opt?.optional === true)
        return data as Type<T | undefined>
      return data as Type<T>
    }

    function string(opt?: TypeOptions) {
      return generic<string>(opt)
    }

    function number(opt?: TypeOptions) {
      return generic<number>(opt)
    }

    type Infer<T> = T extends Type<infer TT> ? TT : never

    // const optional = true

    const age = number({ optional: true })
    type ageType = typeof age
    type ageTypeInfer = Infer<typeof age>
    const testAge: ageTypeInfer = undefined

    const name = string()
    type nameType = Infer<typeof name>

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

    const sample2: Schema = {
      name: 'Hello',
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
