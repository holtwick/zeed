import { cloneJsonObject } from '../data'
import type { Infer } from './schema'
import { boolean, float, int, literal, number, object, string, stringLiterals, tuple, union } from './schema'
import type { Expect, IsEqual } from './test'

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
      // status: stringLiterals(['active', 'trialing', 'past_due', 'paused', 'deleted']),
      // status: string<Status>(),
      obj: object({
        test: float(),
      }).optional(),
      lit,
    })

    type Schema = Infer<typeof schema>
    type SchemaTest = Expect<IsEqual<Schema, {
      id?: string | undefined
      age?: number | undefined
      obj?: {
        test: number
      } | undefined
      name: string
      active: boolean
      lit: 'active' | 'trialing' | 'past_due' | 'paused' | 'deleted'
    }>> // Should pass

    const sample: Schema = {
      name: 'Hello',
      age: 42,
      active: true,
      lit: 'past_due',
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
        },
        "type": "object",
      }
    `)

    expect(schema.parse(sample)).toMatchInlineSnapshot(`
      Object {
        "active": true,
        "age": 42,
        "id": "123",
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

    const sample: Schema = {
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
            "type": "string",
          },
          "name": Object {
            "type": "string",
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
})
