'strict'

import type { Infer } from '.'
import { number, object, string } from '.'

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

    const sample2: Schema = {
      name: 'Hello',
    }

    expect(schema).toMatchInlineSnapshot(`
      Object {
        "_object": Object {
          "age": Object {
            "_check": [Function],
            "_optional": true,
            "default": [Function],
            "optional": [Function],
            "parse": [Function],
            "type": "number",
          },
          "id": Object {
            "_check": [Function],
            "_default": [Function],
            "default": [Function],
            "optional": [Function],
            "parse": [Function],
            "type": "string",
          },
          "name": Object {
            "_check": [Function],
            "default": [Function],
            "optional": [Function],
            "parse": [Function],
            "type": "string",
          },
          "obj": Object {
            "_object": Object {
              "test": Object {
                "_check": [Function],
                "default": [Function],
                "optional": [Function],
                "parse": [Function],
                "type": "number",
              },
            },
            "_optional": true,
            "default": [Function],
            "optional": [Function],
            "parse": [Function],
            "type": "object",
          },
        },
        "default": [Function],
        "optional": [Function],
        "parse": [Function],
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
})
