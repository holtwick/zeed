import { uuid } from '../uuid'
import { createWithSchema } from './parse-object'
import { z } from './schema'

describe('schema parse obj', () => {
  it('create schema', async () => {
    const schema = z.object({
      id: z.string().default(uuid),
      title: z.string(),
      age: z.int().optional(),
    })

    const obj = createWithSchema(schema)

    expect(obj).toMatchInlineSnapshot(`
      Object {
        "age": undefined,
        "id": "1nYSOvISC0IkHySwN6G1k1",
        "title": undefined,
      }
    `)

    expect(obj).toEqual({
      id: expect.any(String),
      title: undefined,
      age: undefined,
    })
  })
})
