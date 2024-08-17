/* eslint-disable ts/consistent-type-definitions */

'strict'

describe('simple.spec', () => {
  it('should do something', async () => {
    type TypeProps = {
      type: string
      children?: []
    }

    type Type<T = unknown> = {
      // _ts: T
      optional: () => Type<T | undefined>
      default: (value: T | (() => T)) => Type<T>
      _optional?: boolean
      _default?: T | (() => T)
    } & TypeProps

    function generic<T = any>(type: string, opt?: TypeProps): Type<T> {
      const info: Type<T> = {
        // _ts: null as any,
        ...opt,
        type,
        optional() {
          this._optional = true
          return this as any
        },
        default(value) {
          this._default = value
          return this
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

    function boolean(opt?: TypeProps) {
      return generic<boolean>('boolean', opt)
    }

    type Infer<T> = T extends Type<infer TT> ? TT : never

    const age = number().optional()
    type ageTypeInfer = Infer<typeof age>
    const testAge: ageTypeInfer = undefined

    const name = string()
    type nameType = Infer<typeof name>

    expect(testAge).toBe(undefined)

    //

    type ObjectInput = Record<string, Type<any>>

    type ObjectFixOptional<T> = {
      [K in keyof T as undefined extends T[K] ? K : never]?: T[K] & {}
    } & {
      [K in keyof T as undefined extends T[K] ? never : K]: T[K] & {}
    }

    type ObjectPretty<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

    // type pretty = ObjectPretty<ObjectFixOptional<{
    //   name?: string
    //   age: number | undefined
    //   must: object
    // }>>

    type ObjectOutput<T extends ObjectInput> = Type<ObjectPretty<ObjectFixOptional<{
      [K in keyof T]: Infer<T[K]>
    }>>>

    function object<T extends ObjectInput>(obj: T, opt?: TypeProps): ObjectOutput<T> {
      const info = generic('object', opt)
      info.children = obj as any
      return info
    }

    const schema = object({
      name: string(),
      age: number().optional(),
      // obj: object({
      //   test: number(),
      // }).optional(),
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
            "_optional": true,
            "default": [Function],
            "optional": [Function],
            "type": "number",
          },
          "name": Object {
            "default": [Function],
            "optional": [Function],
            "type": "string",
          },
        },
        "default": [Function],
        "optional": [Function],
        "type": "object",
      }
    `)

    // const demo = {
    //   a: 1,
    // } as any

    // demo.prototype = {
    //   doSomething() {
    //     return this.a + 1
    //   },
    // }

    // expect(demo).toMatchInlineSnapshot(`
    //   Object {
    //     "a": 1,
    //     "prototype": Object {
    //       "doSomething": [Function],
    //     },
    //   }
    // `)

    // expect(demo.doSomething()).toMatchInlineSnapshot()
  })
})
