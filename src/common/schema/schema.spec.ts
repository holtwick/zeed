import type { Infer } from './schema'
import type { Expect, IsEqual } from './type-test'
import { cloneJsonObject } from '../data'
import { uuid } from '../uuid'
import { any, array, boolean, float, int, literal, number, object, string, stringLiterals, tuple, union, z } from './schema'

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
    })

    type Schema = Infer<typeof schema>
    type SchemaTest = Expect<IsEqual<Schema, {
      id: string
      age?: number | undefined
      obj?: {
        test: number
      } | undefined
      name: string
      info?: any
      active: boolean
      tags?: string[]
      lit: 'active' | 'trialing' | 'past_due' | 'paused' | 'deleted'
    }>> // Should pass

    const sample: Partial<Schema> = {
      name: 'Hello',
      age: 42,
      active: true,
      lit: 'past_due',
      info: 123,
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
            "_optional": true,
            "type": "any",
          },
          "lit": Object {
            "type": "string",
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

    expect(schema.parse(sample)).toMatchInlineSnapshot(`
      Object {
        "active": true,
        "age": 42,
        "id": "123",
        "info": 123,
        "lit": "past_due",
        "name": "Hello",
      }
    `)

    expect(schema.map(sample, (v, s) => {
      if (s.type === 'boolean') {
        return v ? 'on' : 'off'
      }
    })).toMatchInlineSnapshot(`
      Object {
        "active": "on",
        "age": 42,
        "info": 123,
        "lit": "past_due",
        "name": "Hello",
        "obj": Object {},
      }
    `)

    expect(schema.map(sample, function (v) {
      if (this.type === 'boolean') {
        return v ? 'yes' : 'no'
      }
    })).toMatchInlineSnapshot(`
      Object {
        "active": "yes",
        "age": 42,
        "info": 123,
        "lit": "past_due",
        "name": "Hello",
        "obj": Object {},
      }
    `)

    // expect(schema.parse({} as any)).toBe()
  })

  it('union', async () => {
    const literals = [
      literal('one'),
      literal('two'),
      literal('three'),
    ]

    const schema = object({
      id: string().default(() => '123').props({
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
            "_props": Object {},
            "type": "string",
          },
          "literal": Object {
            "_default": "demo",
            "type": "literal",
          },
          "name": Object {
            "type": "literal",
          },
        },
        "type": "object",
      }
    `)

    expect(schema.parse(sample)).toMatchInlineSnapshot(`
      Object {
        "id": "123",
        "literal": "demo",
        "name": "two",
      }
    `)
    // expect(schema.parse({} as any)).toBe()
  })

  it('union with object', async () => {
    const obj = union([
      object({ subscription: literal(true), subscriptionId: string() }),
      object({ subscription: literal(false), licenseId: string() }),
    ])
    type Schema = Infer<typeof obj>
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
    }>()
  })
})
