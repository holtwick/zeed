import { setUuidDefaultEncoding, uuid } from '../uuid'
import { schemaCreateObject, schemaValidateObject } from './parse-object'
import { z } from './schema'

describe('schema parse obj', () => {
  it('create schema', async () => {
    setUuidDefaultEncoding('test')

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
        "id": "test-0",
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

    const messages: any[] = []
    const ok = schemaValidateObject(schema, obj, { messages })
    expect(ok).toBe(false)
    expect(messages).toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "Primitive valid",
          "path": ".id",
          "type": "string",
          "valid": false,
        },
        Object {
          "message": "Invalid property 'id'",
          "path": ".",
          "type": "object",
          "valid": false,
        },
      ]
    `)
  })

  it('should create primitive', async () => {
    const v = z.string().default('test')
    expect(schemaCreateObject(v)).toEqual('test')
  })
})
