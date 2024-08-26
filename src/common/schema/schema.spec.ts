import { cloneJsonObject } from '../data'
import { boolean, float, int, literal, object, string, union } from './schema'
import type { Infer } from './types'

describe('schema', () => {
  it('create schema', async () => {
    type Status = 'active' | 'trialing' | 'past_due' | 'paused' | 'deleted'

    const schema = object({
      id: string().default(() => '123'),
      name: string(),
      age: int().optional(),
      active: boolean(),
      // status: stringLiterals(['active', 'trialing', 'past_due', 'paused', 'deleted']),
      status: string<Status>(),
      obj: object({
        test: float(),
      }).optional(),
    })

    type Schema = Infer<typeof schema>

    const sample: Schema = {
      name: 'Hello',
      status: 'active',
      age: 42,
      active: true,
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
          "status": Object {
            "type": "string",
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
        "name": "Hello",
        "status": "active",
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
        "name": "Hello",
        "obj": Object {},
        "status": "active",
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
        "name": "Hello",
        "obj": Object {},
        "status": "active",
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
            "_union": Array [
              Object {
                "type": "string",
              },
              Object {
                "type": "string",
              },
              Object {
                "type": "string",
              },
            ],
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
