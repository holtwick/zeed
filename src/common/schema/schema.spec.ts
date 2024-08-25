import { cloneJsonObject } from '../data'
import { literal, number, object, string, union } from './schema'
import type { Infer } from './types'

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
