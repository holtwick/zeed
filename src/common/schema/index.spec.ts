/* eslint-disable ts/consistent-type-definitions */
describe('simple.spec', () => {
  it('should do something', async () => {
    type TypeProps = {
      type: string
      children?: []
      isOptional?: boolean
    }

    type Type<T = unknown> = {
      _ts: T
      optional: () => Type<T | undefined>
    } & TypeProps

    function generic<T = unknown>(type: string, opt?: TypeProps): Type<T> {
      const info = {
        _ts: null as any,
        ...opt,
        type,
        optional: () => {
          info.isOptional = true
          return info
        },
      }
      return info
    }

    function string(opt?: TypeProps) {
      return generic<string>('string', opt)
    }

    function number(opt?: TypeProps) {
      return generic<number>('number', opt)
    }

    type Infer<T> = T extends Type<infer TT> ? TT : never

    // const optional = true

    const age = number().optional()
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

    function object<T extends ObjectInput>(obj: T, opt?: TypeProps): ObjectOutput<T> {
      return { type: 'object', children: obj as any } as any
    }

    const schema = object({
      name: string(),
      age: number().optional(),
      obj: object({
        test: number(),
      }).optional(),
    })

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
