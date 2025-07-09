import { setUuidDefaultEncoding, uuid } from '../uuid'
import { schemaCreateObject, schemaParseObject, schemaValidateObject } from './parse-object'
import { z } from './z'

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
        "id": "test-0",
      }
    `)

    expect(obj).toEqual({
      id: expect.any(String),
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
          "message": "Check",
          "path": ".id",
          "type": "string",
          "valid": true,
        },
        Object {
          "message": "Check",
          "path": ".title",
          "type": "string",
          "valid": false,
        },
        Object {
          "message": "Invalid property 'title'",
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

  it('should parse object', async () => {
    const schema = z.object({
      id: z.string(),
      title: z.string(),
      age: z.int().optional(),
      address: z.object({
        street: z.string(),
        city: z.string().optional(),
      }),
    })

    const input = {
      id: '123',
      title: 'Test Title',
      age: '25', // string that should be parsed to int
      address: {
        street: 'Main St',
        city: 'Test City',
      },
      extraField: 'should be ignored', // extra field
    }

    const result = schemaParseObject(schema, input)

    expect(result).toEqual({
      id: '123',
      title: 'Test Title',
      age: 25, // parsed to number
      address: {
        street: 'Main St',
        city: 'Test City',
      },
    })
  })

  it('should parse object with allowExtra option', async () => {
    const schema = z.object({
      id: z.string(),
      title: z.string(),
      obj: z.object({
        field1: z.string().default('default1'),
      }),
    })

    const input = {
      id: '123',
      title: 'Test Title',
      extraField: 'should be kept',
      anotherExtra: 42,
    }

    const resultWithoutExtra = schemaParseObject(schema, input)
    expect(resultWithoutExtra).toEqual({
      id: '123',
      title: 'Test Title',
      obj: {
        field1: 'default1',
      },
    })

    // Test that allowExtra option doesn't currently preserve extra fields
    // (implementation may not support this feature yet)
    const resultWithExtra = schemaParseObject(schema, input, { allowExtra: true })
    expect(resultWithExtra).toEqual({
      id: '123',
      title: 'Test Title',
      obj: {
        field1: 'default1',
      },
      extraField: 'should be kept',
      anotherExtra: 42,
    })
  })

  it('should handle non-optional objects defaulting to empty objects', async () => {
    const schema = z.object({
      id: z.string(),
      requiredObj: z.object({
        field1: z.string().default('default1'),
        field2: z.string(),
      }),
      optionalObj: z.object({
        field3: z.string().default('default3'),
      }).optional(),
    })

    // Test with missing nested objects
    const input1 = {
      id: '123',
      // requiredObj is missing - should create empty object with defaults
      // optionalObj is missing - should be undefined
    }

    const result1 = schemaParseObject(schema, input1)
    expect(result1).toEqual({
      id: '123',
      requiredObj: {
        field1: 'default1',
        // field2 is missing (not undefined) since it has no default
      },
      // optionalObj is missing (not undefined) since it's optional and not provided
    })

    // Test with null nested objects
    const input2 = {
      id: '456',
      requiredObj: null, // should still create object with defaults
      optionalObj: null, // should remain undefined for optional
    }

    const result2 = schemaParseObject(schema, input2)
    expect(result2).toEqual({
      id: '456',
      requiredObj: {
        field1: 'default1',
        field2: undefined,
      },
      optionalObj: undefined,
    })

    // Test with partial nested objects
    const input3 = {
      id: '789',
      requiredObj: {
        field2: 'provided value',
      },
      optionalObj: {
        // field3 should get default
      },
    }

    const result3 = schemaParseObject(schema, input3)
    expect(result3).toEqual({
      id: '789',
      requiredObj: {
        field1: 'default1', // from default
        field2: 'provided value', // from input
      },
      optionalObj: {
        field3: 'default3', // from default
      },
    })
  })
})
