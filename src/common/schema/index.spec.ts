'strict'

import type { Infer } from '.'
import { number, object, string } from '.'

describe('schema', () => {
  it('create schema', async () => {
    const schema = object({
      id: string().default(() => '123'),
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
        "_object": Object {
          "age": Object {
            "_optional": true,
            "default": [Function],
            "optional": [Function],
            "parse": [Function],
            "type": "number",
          },
          "name": Object {
            "default": [Function],
            "optional": [Function],
            "parse": [Function],
            "type": "string",
          },
        },
        "default": [Function],
        "optional": [Function],
        "parse": [Function],
        "type": "object",
      }
    `)

    expect(schema.parse(sample)).toBe(true)
    expect(schema.parse({} as any)).toBe(false)
  })
})
