describe('simple.spec', () => {
  it('should do something', async () => {
    interface TypeOptions {
      optional?: boolean
    }

    interface Type<T = unknown> {
      _ts?: T
      type: string
      children?: [] // todo
    }

    function string(opt?: TypeOptions): Type<string> {
      return { ...opt, type: 'string' }
    }

    function number(opt?: TypeOptions): Type<number> {
      return { ...opt, type: 'number' }
    }

    type Infer<T> = T extends Type<infer TT> ? TT : never

    type ObjectInput = Record<string, Type>
    type ObjectPretty<V> = Extract<{ [K in keyof V]: V[K] }, unknown>
    type ObjectOutput<T extends ObjectInput> = ObjectPretty<Type<{
      [K in keyof T]: Infer<T[K]>
    }>>

    function object<T extends ObjectInput>(obj: T): ObjectOutput<T> {
      return { type: 'object', children: obj as any } as any
    }

    const optional = true

    const schema = object({
      name: string(),
      age: number({ optional }),
    })

    type Schema = Infer<typeof schema>

    const sample: Schema = {
      name: 'Hello',
      age: '42',
    }

    expect(schema).toMatchInlineSnapshot(`
      Object {
        "children": Object {
          "name": Object {
            "type": "string",
          },
        },
        "type": "object",
      }
    `)
  })
})

// // Define the schema functions
// // const string = () => ({} as { type: () => string }) // This will be inferred as 'string'
// const number = () => ({} as { type: () => number }) // This will be inferred as 'number'
// const optional = <T>(sub: { type: () => T }) => ({ type: sub.type, optional: true } as { type: () => T | undefined, optional: true })
// const union = <T extends any[]>(...types: (() => T[number])[]) => () => types

// // Define the object function to create a schema
// const object = <T extends SchemaDefinition>(schema: T) => schema

// // Create the schema
// const schema = object({
//   name: string(), // name is a string
//   age: optional(number()), // age is optional
//   // status: union(string, () => 'active' | 'inactive'), // status can be a string or a specific union type
// })

// // Infer the type from the schema
// type Schema = InferSchema<typeof schema>

// // Example usage
// const example: Schema = {
//   name: 'John Doe', // should be a string
//   age: 30, // should be a number or undefined
//   status: 'active', // should be a string or "active" | "inactive"
// }

// // Valid examples
// const validExample1: Schema = {
//   name: 'Jane Doe',
//   age: undefined, // age is optional
//   status: 'inactive',
// }

// const validExample2: Schema = {
//   name: 'Alice',
//   status: 'active',
// }

// // This will throw a TypeScript error if the types do not match
// const invalidExample: Schema = {
//   name: 123, // Error: Type 'number' is not assignable to type 'string'
//   age: '30', // Error: Type 'string' is not assignable to type 'number | undefined'
//   status: 'unknown', // Error: Type '"unknown"' is not assignable to type 'string | "active" | "inactive"'
// }
