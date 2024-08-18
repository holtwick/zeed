import { cloneJsonObject } from '../data'
import { literal, number, object, string, union } from './schema'
import type { Infer, Type } from './types'

describe('schema', () => {
  it('create schema', async () => {
    const schema = object({
      id: string().default(() => '123'),
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

    expect(cloneJsonObject(schema)).toMatchInlineSnapshot(`
      Object {
        "_object": Object {
          "age": Object {
            "_optional": true,
            "type": "number",
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
        },
        "type": "object",
      }
    `)

    expect(schema.parse(sample)).toMatchInlineSnapshot(`
      Object {
        "age": 42,
        "id": "123",
        "name": "Hello",
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
      id: string().default(() => '123'),
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
            "type": "string",
          },
          "literal": Object {
            "type": "literal",
          },
          "name": Object {
            "_union": Array [
              Object {
                "type": "literal",
              },
              Object {
                "type": "literal",
              },
              Object {
                "type": "literal",
              },
            ],
            "type": "union",
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
