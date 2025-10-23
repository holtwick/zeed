import type { StandardSchemaV1 } from './standard-schema'
import { any, array, boolean, int, literal, number, object, record, string, stringLiterals, tuple, union } from './schema'
import { z } from './z'

describe('standard-schema', () => {
  it('should implement StandardSchemaV1 interface', () => {
    const schema = string()

    // Check that the ~standard property exists
    expect(schema['~standard']).toBeDefined()
    expect(schema['~standard'].version).toBe(1)
    expect(schema['~standard'].vendor).toBe('zeed')
    expect(typeof schema['~standard'].validate).toBe('function')
  })

  it('should validate string types', () => {
    const schema = string()
    const result = schema['~standard'].validate('hello')

    expect(result.issues).toBeUndefined()
    expect(result.value).toBe('hello')

    const failResult = schema['~standard'].validate(123)
    expect(failResult.issues).toBeDefined()
    expect(failResult.issues!.length).toBeGreaterThan(0)
    expect(failResult.issues![0].message).toContain('string')
  })

  it('should validate number types', () => {
    const schema = number()
    const result = schema['~standard'].validate(42)

    expect(result.issues).toBeUndefined()
    expect(result.value).toBe(42)

    const failResult = schema['~standard'].validate('not a number')
    expect(failResult.issues).toBeDefined()
  })

  it('should validate integer types', () => {
    const schema = int()
    const result = schema['~standard'].validate(42)

    expect(result.issues).toBeUndefined()
    expect(result.value).toBe(42)

    const failResult = schema['~standard'].validate(42.5)
    expect(failResult.issues).toBeDefined()
  })

  it('should validate boolean types', () => {
    const schema = boolean()
    const result = schema['~standard'].validate(true)

    expect(result.issues).toBeUndefined()
    expect(result.value).toBe(true)

    const failResult = schema['~standard'].validate('true')
    expect(failResult.issues).toBeDefined()
  })

  it('should handle optional values', () => {
    const schema = string().optional()

    const result1 = schema['~standard'].validate('hello')
    expect(result1.issues).toBeUndefined()
    expect(result1.value).toBe('hello')

    const result2 = schema['~standard'].validate(undefined)
    expect(result2.issues).toBeUndefined()
    expect(result2.value).toBeUndefined()

    const result3 = schema['~standard'].validate(null)
    expect(result3.issues).toBeUndefined()
  })

  it('should handle default values', () => {
    const schema = string().default('default-value')
    const result = schema['~standard'].validate(undefined)

    expect(result.issues).toBeUndefined()
    expect(result.value).toBe('default-value')
  })

  it('should validate object schemas', () => {
    const schema = object({
      name: string(),
      age: number(),
    })

    const result = schema['~standard'].validate({
      name: 'John',
      age: 30,
    })

    expect(result.issues).toBeUndefined()
    expect(result.value).toEqual({ name: 'John', age: 30 })

    const failResult = schema['~standard'].validate({
      name: 'John',
      age: 'thirty',
    })

    expect(failResult.issues).toBeDefined()
    expect(failResult.issues!.length).toBeGreaterThan(0)
  })

  it('should validate nested objects', () => {
    const schema = object({
      user: object({
        name: string(),
        email: string(),
      }),
      active: boolean(),
    })

    const result = schema['~standard'].validate({
      user: {
        name: 'Jane',
        email: 'jane@example.com',
      },
      active: true,
    })

    expect(result.issues).toBeUndefined()
    expect(result.value).toEqual({
      user: {
        name: 'Jane',
        email: 'jane@example.com',
      },
      active: true,
    })
  })

  it('should validate array schemas', () => {
    const schema = array(string())
    const result = schema['~standard'].validate(['a', 'b', 'c'])

    expect(result.issues).toBeUndefined()
    expect(result.value).toEqual(['a', 'b', 'c'])

    const failResult = schema['~standard'].validate(['a', 123, 'c'])
    expect(failResult.issues).toBeDefined()
  })

  it('should validate tuple schemas', () => {
    const schema = tuple([string(), number(), boolean()])
    const result = schema['~standard'].validate(['hello', 42, true])

    expect(result.issues).toBeUndefined()
    expect(result.value).toEqual(['hello', 42, true])

    const failResult1 = schema['~standard'].validate(['hello', 'not a number', true])
    expect(failResult1.issues).toBeDefined()

    const failResult2 = schema['~standard'].validate(['hello', 42])
    expect(failResult2.issues).toBeDefined()
  })

  it('should validate record schemas', () => {
    const schema = record(number())
    const result = schema['~standard'].validate({
      a: 1,
      b: 2,
      c: 3,
    })

    expect(result.issues).toBeUndefined()
    expect(result.value).toEqual({ a: 1, b: 2, c: 3 })

    const failResult = schema['~standard'].validate({
      a: 1,
      b: 'not a number',
    })
    expect(failResult.issues).toBeDefined()
  })

  it('should validate union schemas', () => {
    const schema = union([string(), number()])

    const result1 = schema['~standard'].validate('hello')
    expect(result1.issues).toBeUndefined()
    expect(result1.value).toBe('hello')

    const result2 = schema['~standard'].validate(42)
    expect(result2.issues).toBeUndefined()
    expect(result2.value).toBe(42)

    const failResult = schema['~standard'].validate(true)
    expect(failResult.issues).toBeDefined()
  })

  it('should validate literal values', () => {
    const schema = literal('specific-value')
    const result = schema['~standard'].validate('specific-value')

    expect(result.issues).toBeUndefined()
    expect(result.value).toBe('specific-value')

    const failResult = schema['~standard'].validate('other-value')
    expect(failResult.issues).toBeDefined()
  })

  it('should validate string literals (enums)', () => {
    const schema = stringLiterals(['active', 'inactive', 'pending'])
    const result = schema['~standard'].validate('active')

    expect(result.issues).toBeUndefined()
    expect(result.value).toBe('active')

    const failResult = schema['~standard'].validate('unknown')
    expect(failResult.issues).toBeDefined()
  })

  it('should validate any type', () => {
    const schema = any()

    const result1 = schema['~standard'].validate('string')
    expect(result1.issues).toBeUndefined()

    const result2 = schema['~standard'].validate(123)
    expect(result2.issues).toBeUndefined()

    const result3 = schema['~standard'].validate({ key: 'value' })
    expect(result3.issues).toBeUndefined()

    const failResult = schema['~standard'].validate(null)
    expect(failResult.issues).toBeDefined()
  })

  it('should provide path information in issues', () => {
    const schema = object({
      user: object({
        name: string(),
        age: number(),
      }),
    })

    const failResult = schema['~standard'].validate({
      user: {
        name: 'John',
        age: 'not a number',
      },
    })

    expect(failResult.issues).toBeDefined()
    expect(failResult.issues!.length).toBeGreaterThan(0)

    const issue = failResult.issues![0]
    expect(issue.path).toBeDefined()
    expect(issue.message).toBeDefined()
  })

  it('should work with complex nested schema', () => {
    const schema = object({
      id: string(),
      name: string(),
      age: int().optional(),
      tags: array(string()),
      settings: object({
        notifications: boolean(),
        theme: stringLiterals(['light', 'dark']),
      }),
      metadata: record(any()).optional(),
    })

    const validData = {
      id: 'user-123',
      name: 'Alice',
      age: 25,
      tags: ['admin', 'developer'],
      settings: {
        notifications: true,
        theme: 'dark',
      },
      metadata: {
        lastLogin: '2024-01-01',
        loginCount: 42,
      },
    }

    const result = schema['~standard'].validate(validData)
    expect(result.issues).toBeUndefined()
    expect(result.value).toEqual(validData)
  })

  it('should support z namespace', () => {
    const schema = z.object({
      name: z.string(),
      count: z.number(),
    })

    const result = schema['~standard'].validate({
      name: 'test',
      count: 5,
    })

    expect(result.issues).toBeUndefined()
    expect(result.value).toEqual({ name: 'test', count: 5 })
  })

  it('should type-check with StandardSchemaV1.InferInput and InferOutput', () => {
    const schema = object({
      name: string(),
      age: number(),
    })

    // Type inference should work
    type Input = StandardSchemaV1.InferInput<typeof schema>
    type Output = StandardSchemaV1.InferOutput<typeof schema>

    // These should be equivalent for zeed schemas (no transformation)
    const input: Input = { name: 'test', age: 25 }
    const output: Output = { name: 'test', age: 25 }

    expect(input).toEqual(output)
  })

  it('should be synchronous (not return Promise)', () => {
    const schema = string()
    const result = schema['~standard'].validate('hello')

    expect(result).not.toBeInstanceOf(Promise)
    expect(typeof result).toBe('object')
  })

  it('should handle default values as functions', () => {
    const schema = string().default(() => 'generated-value')
    const result = schema['~standard'].validate(undefined)

    expect(result.issues).toBeUndefined()
    expect(result.value).toBe('generated-value')
  })

  it('should validate objects with optional properties', () => {
    const schema = object({
      required: string(),
      optional: number().optional(),
    })

    const result1 = schema['~standard'].validate({
      required: 'test',
      optional: 42,
    })
    expect(result1.issues).toBeUndefined()
    expect(result1.value).toEqual({ required: 'test', optional: 42 })

    const result2 = schema['~standard'].validate({
      required: 'test',
    })
    expect(result2.issues).toBeUndefined()
    expect(result2.value).toEqual({ required: 'test', optional: undefined })
  })

  it('should provide helpful error messages', () => {
    const schema = object({
      name: string(),
      age: number(),
      status: stringLiterals(['active', 'inactive']),
    })

    const failResult = schema['~standard'].validate({
      name: 'John',
      age: 'thirty',
      status: 'unknown',
    })

    expect(failResult.issues).toBeDefined()
    expect(failResult.issues!.length).toBeGreaterThan(0)

    // Should have messages about the invalid fields
    const messages = failResult.issues!.map(i => i.message).join(' ')
    expect(messages).toBeTruthy()
  })
})
