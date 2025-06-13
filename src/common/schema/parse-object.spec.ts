import { uuid } from '../uuid'
import { schemaCreateObject } from './parse-object'
import { z } from './schema'

describe('schema parse obj', () => {
  it('create schema', async () => {
    const schema = z.object({
      id: z.string().default(uuid),
      title: z.string(),
      age: z.int().optional(),
      address: z.object({
        street: z.string().default('Main St'),
      }),
    })

    const obj = schemaCreateObject(schema)

    expect(obj).toMatchInlineSnapshot(`
      Object {
        "address": Object {
          "street": "Main St",
        },
        "age": undefined,
        "id": "7i7oUTFTn8wMvHXcbwVUXX",
        "title": undefined,
      }
    `)

    expect(obj).toEqual({
      id: expect.any(String),
      title: undefined,
      age: undefined,
      address: {
        street: 'Main St',
      },
    })
  })
})
