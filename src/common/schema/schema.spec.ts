import type { Infer } from './schema'
import type { Expect, IsEqual } from './type-test'
import { cloneJsonObject } from '../data'
import { uuid } from '../uuid'
import { schemaParseObject } from './parse-object'
import { any, array, boolean, float, int, literal, number, object, string, stringLiterals, tuple, union } from './schema'
import { z } from './z'

describe('schema', () => {
  it('create schema', async () => {
    // Literals
    type Status = 'active' | 'trialing' | 'past_due' | 'paused' | 'deleted'
    const lit = stringLiterals(['active', 'trialing', 'past_due', 'paused', 'deleted'])
    type ScheamLiterals = Infer<typeof lit>
    type SchemaLiteralsTest = Expect<IsEqual<ScheamLiterals, Status>> // Should pass
    expectTypeOf<ScheamLiterals>().toMatchTypeOf<Status>()

    // Tuple
    const tup = tuple([number(), string(), boolean()])
    type SchemaTuple = Infer<typeof tup> // expected [number, string, boolean]
    type SchemaTupleTest = Expect<IsEqual<SchemaTuple, [number, string, boolean]>> // Should pass
    expectTypeOf<SchemaTuple>().toMatchTypeOf<[number, string, boolean]>()

    const s1 = string().optional() // .pattern(/\d+/)
    type t1a = typeof s1
    type t1 = Infer<typeof s1>
    expectTypeOf<t1>().toMatchTypeOf<string | undefined>()

    type CustomType = string | number | boolean

    const schema = object({
      id: string().default('123'), // default(() => '123'),
      name: string(),
      age: int().optional(),
      active: boolean(),
      tags: array(string()).optional(),
      info: any(),
      // status: stringLiterals(['active', 'trialing', 'past_due', 'paused', 'deleted']),
      // status: string<Status>(),
      obj: object({
        test: float(),
      }).optional(),
      lit,
      log: any<CustomType>(),
    })

    type Schema = Infer<typeof schema>
    type SchemaTest = Expect<IsEqual<Schema, {
      age?: number | undefined
      tags?: string[] | undefined
      info?: any
      obj?: {
        test: number
      } | undefined
      log: CustomType
      id: string
      name: string
      active: boolean
      lit: 'active' | 'trialing' | 'past_due' | 'paused' | 'deleted'
    }>> // Should pass

    const sample: Omit<Schema, 'id'> = {
      name: 'Hello',
      age: 42,
      active: true,
      lit: 'past_due',
      info: 123,
      log: true,
    }

    // const s: Status = sample.status

    expect(cloneJsonObject(schema)).toMatchInlineSnapshot(`
      Object {
        "_object": Object {
          "active": Object {
            "type": "boolean",
          },
          "age": Object {
            "_optional": true,
            "type": "int",
          },
          "id": Object {
            "_default": "123",
            "type": "string",
          },
          "info": Object {
            "type": "any",
          },
          "lit": Object {
            "_enumValues": Array [
              "active",
              "trialing",
              "past_due",
              "paused",
              "deleted",
            ],
            "type": "string",
          },
          "log": Object {
            "type": "any",
          },
          "name": Object {
            "type": "string",
          },
          "obj": Object {
            "_object": Object {
              "test": Object {
                "type": "number",
              },
            },
            "_optional": true,
            "type": "object",
          },
          "tags": Object {
            "_optional": true,
            "_type": Object {
              "type": "string",
            },
            "type": "array",
          },
        },
        "type": "object",
      }
    `)

    expect(schemaParseObject(schema, sample)).toMatchInlineSnapshot(`
      Object {
        "active": true,
        "age": 42,
        "id": "123",
        "info": 123,
        "lit": "past_due",
        "log": true,
        "name": "Hello",
      }
    `)

    // expect(schema.map(sample, (v, s) => {
    //   if (s.type === 'boolean') {
    //     return v ? 'on' : 'off'
    //   }
    // })).toMatchInlineSnapshot(`
    //   Object {
    //     "active": "on",
    //     "age": 42,
    //     "info": 123,
    //     "lit": "past_due",
    //     "log": true,
    //     "name": "Hello",
    //     "obj": Object {},
    //   }
    // `)

    // expect(schema.map(sample, function (v) {
    //   if (this.type === 'boolean') {
    //     return v ? 'yes' : 'no'
    //   }
    // })).toMatchInlineSnapshot(`
    //   Object {
    //     "active": "yes",
    //     "age": 42,
    //     "info": 123,
    //     "lit": "past_due",
    //     "log": true,
    //     "name": "Hello",
    //     "obj": Object {},
    //   }
    // `)

    // expect(schema.parse({} as any)).toBe()
  })

  it('union', async () => {
    const literals = [
      literal('one'),
      literal('two'),
      literal('three'),
    ]

    const schema = object({
      id: string().default(() => '123').meta({
        // someProp: 'someValue',
      }),
      literal: literal('demo'),
      name: union(literals),
    })

    type Schema = Infer<typeof schema>

    const sample: Partial<Schema> = {
      literal: 'demo',
      name: 'two',
    }

    expect(cloneJsonObject(schema)).toMatchInlineSnapshot(`
      Object {
        "_object": Object {
          "id": Object {
            "_meta": Object {},
            "type": "string",
          },
          "literal": Object {
            "_default": "demo",
            "type": "literal",
          },
          "name": Object {
            "_union": Array [
              Object {
                "_default": "one",
                "type": "literal",
              },
              Object {
                "_default": "two",
                "type": "literal",
              },
              Object {
                "_default": "three",
                "type": "literal",
              },
            ],
            "type": "union",
          },
        },
        "type": "object",
      }
    `)

    expect(schemaParseObject(schema, sample)).toMatchInlineSnapshot(`
      Object {
        "id": "123",
        "literal": "demo",
      }
    `)
    // expect(schema.parse({} as any)).toBe()
  })

  it('union with object', async () => {
    const obj = union([
      object({ subscription: literal(true), subscriptionId: string() }),
      object({ subscription: literal(false), licenseId: string() }),
    ])
    // type Schema = Infer<typeof obj>
    type Schema = z.infer<typeof obj>
    type SchemaExpected = {
      subscription: true
      subscriptionId: string
    } | {
      subscription: false
      licenseId: string
    }
    type _SchemaTest = Expect<IsEqual<Schema, SchemaExpected>> // Should pass
    expectTypeOf<Schema>().toMatchTypeOf<SchemaExpected>()
  })

  it('mimic extend schema', async () => {
    const baseSchema = z.object({
      id: string().default(uuid),
    })
    const extendedSchema = baseSchema.extend({
      name: string(),
      age: int().optional(),
      active: boolean(),
      tags: array(string()).optional(),
      info: any(),
      description: string().optional(),
    })
    type BaseSchema = Infer<typeof baseSchema>
    type ExtendedSchema = Infer<typeof extendedSchema>
    expectTypeOf<BaseSchema>().toMatchObjectType<{ id: string }>()
    expectTypeOf<ExtendedSchema>().toMatchObjectType<{
      id: string
      age?: number | undefined
      tags?: string[] | undefined
      info?: any
      name: string
      active: boolean
      description?: string | undefined
    }>()
  })

  it('optional and default', async () => {
    const s = z.object({
      def1: z.string().default('hallo'), // not optional!
      def2: z.string().default('hallo').optional(),
      def3: z.string().optional().default('hallo'), // different order
      def4: z.string().optional(),
    })
    type Schema = Infer<typeof s>
    type SchemaTest = Expect<IsEqual<Schema, {
      def1: string
      def2?: string | undefined
      def3?: string | undefined
      def4?: string | undefined
    }>> // Should pass
  })
})
