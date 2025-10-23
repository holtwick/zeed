import type { StandardSchemaV1 } from './schema-standard'
import { describe, expect, it } from 'vitest'
import { any, array, boolean, int, literal, number, object, record, string, stringLiterals, tuple, union } from './schema'

describe('standard-schema compatibility', () => {
  it('should have ~standard property', () => {
    const schema = string()
    expect(schema).toHaveProperty('~standard')
    expect(schema['~standard']).toBeDefined()
  })

  it('should have correct vendor and version', () => {
    const schema = string()
    const standard = schema['~standard']
    expect(standard.version).toBe(1)
    expect(standard.vendor).toBe('zeed')
  })

  it('should have validate function', () => {
    const schema = string()
    const standard = schema['~standard']
    expect(standard.validate).toBeInstanceOf(Function)
  })

  it('should validate string successfully', () => {
    const schema = string()
    const result = schema['~standard'].validate('hello')
    expect(result).toEqual({ value: 'hello' })
    expect(result.issues).toBeUndefined()
  })

  it('should fail string validation', () => {
    const schema = string()
    const result = schema['~standard'].validate(42)
    expect(result.issues).toBeDefined()
    expect(result.issues).toHaveLength(1)
    expect(result.issues![0].message).toContain('Expected string')
  })

  it('should validate number successfully', () => {
    const schema = number()
    const result = schema['~standard'].validate(42.5)
    expect(result).toEqual({ value: 42.5 })
  })

  it('should validate integer successfully', () => {
    const schema = int()
    const result = schema['~standard'].validate(42)
    expect(result).toEqual({ value: 42 })
  })

  it('should fail integer validation for float', () => {
    const schema = int()
    const result = schema['~standard'].validate(42.5)
    expect(result.issues).toBeDefined()
    expect(result.issues).toHaveLength(1)
  })

  it('should validate boolean successfully', () => {
    const schema = boolean()
    const result = schema['~standard'].validate(true)
    expect(result).toEqual({ value: true })
  })

  it('should validate optional values', () => {
    const schema = string().optional()

    const result1 = schema['~standard'].validate(undefined)
    expect(result1).toEqual({ value: undefined })

    const result2 = schema['~standard'].validate(null)
    expect(result2).toEqual({ value: undefined })

    const result3 = schema['~standard'].validate('hello')
    expect(result3).toEqual({ value: 'hello' })
  })

  it('should use default values', () => {
    const schema = string().default('default-value')
    const result = schema['~standard'].validate(undefined)
    expect(result).toEqual({ value: 'default-value' })
  })

  it('should use default function', () => {
    const schema = string().default(() => 'computed-default')
    const result = schema['~standard'].validate(null)
    expect(result).toEqual({ value: 'computed-default' })
  })

  it('should validate literal values', () => {
    const schema = literal('hello')

    const result1 = schema['~standard'].validate('hello')
    expect(result1).toEqual({ value: 'hello' })

    const result2 = schema['~standard'].validate('world')
    expect(result2.issues).toBeDefined()
    expect(result2.issues![0].message).toContain('Expected literal')
  })

  it('should validate string literals (enums)', () => {
    const schema = stringLiterals(['active', 'inactive', 'pending'])

    const result1 = schema['~standard'].validate('active')
    expect(result1).toEqual({ value: 'active' })

    const result2 = schema['~standard'].validate('invalid')
    expect(result2.issues).toBeDefined()
    expect(result2.issues![0].message).toContain('Expected one of')
  })

  it('should validate union types', () => {
    const schema = union([string(), number()])

    const result1 = schema['~standard'].validate('hello')
    expect(result1).toEqual({ value: 'hello' })

    const result2 = schema['~standard'].validate(42)
    expect(result2).toEqual({ value: 42 })

    const result3 = schema['~standard'].validate(true)
    expect(result3.issues).toBeDefined()
    expect(result3.issues![0].message).toContain('does not match any union')
  })

  it('should validate array types', () => {
    const schema = array(string())

    const result1 = schema['~standard'].validate(['a', 'b', 'c'])
    expect(result1).toEqual({ value: ['a', 'b', 'c'] })

    const result2 = schema['~standard'].validate(['a', 42, 'c'])
    expect(result2.issues).toBeDefined()
    expect(result2.issues![0].path).toEqual([1])
  })

  it('should validate tuple types', () => {
    const schema = tuple([string(), number(), boolean()])

    const result1 = schema['~standard'].validate(['hello', 42, true])
    expect(result1).toEqual({ value: ['hello', 42, true] })

    const result2 = schema['~standard'].validate(['hello', 42])
    expect(result2.issues).toBeDefined()
    expect(result2.issues![0].message).toContain('Expected tuple of length 3')

    const result3 = schema['~standard'].validate(['hello', 'wrong', true])
    expect(result3.issues).toBeDefined()
    expect(result3.issues![0].path).toEqual([1])
  })

  it('should validate object types', () => {
    const schema = object({
      name: string(),
      age: number(),
      active: boolean(),
    })

    const result1 = schema['~standard'].validate({
      name: 'Alice',
      age: 30,
      active: true,
    })
    expect(result1.value).toEqual({
      name: 'Alice',
      age: 30,
      active: true,
    })
    expect(result1.issues).toBeUndefined()

    const result2 = schema['~standard'].validate({
      name: 'Bob',
      age: 'invalid',
      active: true,
    })
    expect(result2.issues).toBeDefined()
    expect(result2.issues![0].path).toEqual(['age'])
  })

  it('should validate nested objects', () => {
    const schema = object({
      user: object({
        name: string(),
        profile: object({
          bio: string(),
        }),
      }),
    })

    const result1 = schema['~standard'].validate({
      user: {
        name: 'Alice',
        profile: {
          bio: 'Developer',
        },
      },
    })
    expect(result1.issues).toBeUndefined()

    const result2 = schema['~standard'].validate({
      user: {
        name: 'Bob',
        profile: {
          bio: 123,
        },
      },
    })
    expect(result2.issues).toBeDefined()
    expect(result2.issues![0].path).toEqual(['user', 'profile', 'bio'])
  })

  it('should validate optional object properties', () => {
    const schema = object({
      name: string(),
      age: number().optional(),
    })

    const result1 = schema['~standard'].validate({
      name: 'Alice',
    })
    expect(result1.issues).toBeUndefined()

    const result2 = schema['~standard'].validate({
      name: 'Bob',
      age: 30,
    })
    expect(result2.issues).toBeUndefined()
  })

  it('should validate record types', () => {
    const schema = record(number())

    const result1 = schema['~standard'].validate({
      a: 1,
      b: 2,
      c: 3,
    })
    expect(result1.issues).toBeUndefined()

    const result2 = schema['~standard'].validate({
      a: 1,
      b: 'invalid',
      c: 3,
    })
    expect(result2.issues).toBeDefined()
    expect(result2.issues![0].path).toEqual(['b'])
  })

  it('should support type inference helpers', () => {
    const schema = object({
      name: string(),
      age: number(),
    })

    const standard = schema['~standard']
    expect(standard.types).toBeDefined()

    // Type assertions to verify the types property exists
    type Input = StandardSchemaV1.InferInput<typeof schema>
    type Output = StandardSchemaV1.InferOutput<typeof schema>

    // These are compile-time checks that the types are correctly inferred
    const _inputTest: Input = { name: 'test', age: 42 }
    const _outputTest: Output = { name: 'test', age: 42 }
  })

  it('should be usable with generic standard-schema validators', () => {
    // This mimics how a third-party library would use standard schemas
    function standardValidate<T extends StandardSchemaV1>(
      schema: T,
      value: unknown,
    ): StandardSchemaV1.InferOutput<T> | undefined {
      const result = schema['~standard'].validate(value) as any
      if (result.issues) {
        return undefined
      }
      return result.value
    }

    const stringSchema = string()
    const result1 = standardValidate(stringSchema, 'hello')
    expect(result1).toBe('hello')

    const result2 = standardValidate(stringSchema, 42)
    expect(result2).toBeUndefined()

    const objectSchema = object({ name: string(), age: number() })
    const result3 = standardValidate(objectSchema, { name: 'Alice', age: 30 })
    expect(result3).toEqual({ name: 'Alice', age: 30 })
  })

  it('should handle any type', () => {
    const schema = any()

    const result1 = schema['~standard'].validate('hello')
    expect(result1).toEqual({ value: 'hello' })

    const result2 = schema['~standard'].validate(42)
    expect(result2).toEqual({ value: 42 })

    const result3 = schema['~standard'].validate({ key: 'value' })
    expect(result3).toEqual({ value: { key: 'value' } })

    // any() rejects null/undefined unless made optional
    const result4 = schema['~standard'].validate(null)
    expect(result4.issues).toBeDefined()
  })

  it('should validate with path information in issues', () => {
    const schema = object({
      items: array(object({
        name: string(),
        tags: array(string()),
      })),
    })

    const result = schema['~standard'].validate({
      items: [
        { name: 'Item1', tags: ['a', 'b'] },
        { name: 'Item2', tags: ['c', 42] },
      ],
    })

    expect(result.issues).toBeDefined()
    expect(result.issues![0].path).toEqual(['items', 1, 'tags', 1])
  })
})
