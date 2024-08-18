import { cloneJsonObject } from '../data'
import { number, object, string } from './schema'
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
})
