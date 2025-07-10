import { describe, expect, it } from 'vitest'
import { boolean, literal, number, object, record, string, stringLiterals, tuple, Type, union } from './schema'

describe('schema improvements', () => {
  describe('type class improvements', () => {
    it('should properly chain optional() method', () => {
      const stringType = string()
      const optionalString = stringType.optional()

      expect(stringType._optional).toBe(undefined)
      expect(optionalString._optional).toBe(true)
      expect(stringType).not.toBe(optionalString) // Should create new instance
    })

    it('should properly set default values', () => {
      const stringWithDefault = string().default('hello')
      expect(stringWithDefault._default).toBe('hello')

      const stringWithFunctionDefault = string().default(() => 'dynamic')
      expect(typeof stringWithFunctionDefault._default).toBe('function')
    })

    it('should properly set metadata', () => {
      const stringWithMeta = string().meta({ desc: 'A string field' })
      expect(stringWithMeta._meta?.desc).toBe('A string field')
    })

    it('should properly set description', () => {
      const stringWithDesc = string().describe('A string field')
      expect(stringWithDesc._meta?.desc).toBe('A string field')
    })
  })

  describe('object type improvements', () => {
    it('should properly extend object types', () => {
      const baseSchema = object({
        name: string(),
        age: number(),
      })

      const extendedSchema = baseSchema.extend({
        email: string(),
      })

      expect(extendedSchema._object).toEqual({
        name: expect.any(Type),
        age: expect.any(Type),
        email: expect.any(Type),
      })
    })

    it('should properly pick properties', () => {
      const schema = object({
        name: string(),
        age: number(),
        email: string(),
      })

      const picked = schema.pick({ name: true, age: true })
      expect(picked._object).toEqual({
        name: expect.any(Type),
        age: expect.any(Type),
      })
      expect(picked._object).not.toHaveProperty('email')
    })

    it('should properly omit properties', () => {
      const schema = object({
        name: string(),
        age: number(),
        email: string(),
      })

      const omitted = schema.omit({ email: true })
      expect(omitted._object).toEqual({
        name: expect.any(Type),
        age: expect.any(Type),
      })
      expect(omitted._object).not.toHaveProperty('email')
    })

    it('should properly make all properties partial', () => {
      const schema = object({
        name: string(),
        age: number(),
      })

      const partial = schema.partial()
      expect(partial._object.name._optional).toBe(true)
      expect(partial._object.age._optional).toBe(true)
    })

    it('should properly make specific properties partial', () => {
      const schema = object({
        name: string(),
        age: number(),
        email: string(),
      })

      const partial = schema.partial({ name: true })
      expect(partial._object.name._optional).toBe(true)
      expect(partial._object.age._optional).toBe(undefined)
      expect(partial._object.email._optional).toBe(undefined)
    })

    it('should properly make all properties required', () => {
      const schema = object({
        name: string().optional(),
        age: number().optional(),
      })

      const required = schema.required()
      expect(required._object.name._optional).toBe(false)
      expect(required._object.age._optional).toBe(false)
    })

    it('should properly make specific properties required', () => {
      const schema = object({
        name: string().optional(),
        age: number().optional(),
        email: string().optional(),
      })

      const required = schema.required({ name: true })
      expect(required._object.name._optional).toBe(false)
      expect(required._object.age._optional).toBe(true)
      expect(required._object.email._optional).toBe(true)
    })
  })

  describe('union type improvements', () => {
    it('should properly validate union types', () => {
      const unionType = union([string(), number(), boolean()])

      expect(unionType._check?.('hello')).toBe(true)
      expect(unionType._check?.(42)).toBe(true)
      expect(unionType._check?.(true)).toBe(true)
      expect(unionType._check?.({})).toBe(false)
    })
  })

  describe('string literals improvements', () => {
    it('should properly validate string literals', () => {
      const statusType = stringLiterals(['active', 'inactive', 'pending'] as const)

      expect(statusType._check?.('active')).toBe(true)
      expect(statusType._check?.('inactive')).toBe(true)
      expect(statusType._check?.('pending')).toBe(true)
      expect(statusType._check?.('unknown')).toBe(false)
      expect(statusType._check?.(42)).toBe(false)
    })
  })

  describe('tuple type improvements', () => {
    it('should properly validate tuple types', () => {
      const tupleType = tuple([string(), number(), boolean()])

      expect(tupleType._check?.(['hello', 42, true])).toBe(true)
      expect(tupleType._check?.(['hello', 42])).toBe(false) // Wrong length
      expect(tupleType._check?.(['hello', 'world', true])).toBe(false) // Wrong types
    })
  })

  describe('record type improvements', () => {
    it('should create record type with uniform value type', () => {
      const recordType = record(string())

      expect(recordType.type).toBe('record')
      expect(recordType._type).toBeDefined()
      expect(recordType._check?.({})).toBe(true)
      expect(recordType._check?.('not an object')).toBe(false)
    })
  })

  describe('error handling improvements', () => {
    it('should throw descriptive errors for invalid operations', () => {
      const stringType = string()

      expect(() => stringType.extend({})).toThrow('extend() can only be used on object schemas')
      expect(() => stringType.pick({} as any)).toThrow('pick() can only be used on object schemas')
      expect(() => stringType.omit({} as any)).toThrow('omit() can only be used on object schemas')
      expect(() => stringType.partial()).toThrow('partial() can only be used on object schemas')
      expect(() => stringType.required()).toThrow('required() can only be used on object schemas')
    })
  })

  describe('type safety improvements', () => {
    it('should maintain type safety with proper typing', () => {
      const schema = object({
        name: string(),
        age: number(),
      })

      // These should all be properly typed
      const partial = schema.partial()
      const required = schema.required()
      const picked = schema.pick({ name: true })
      const omitted = schema.omit({ age: true })
      const extended = schema.extend({ email: string() })

      // Basic type checks
      expect(partial._object).toBeDefined()
      expect(required._object).toBeDefined()
      expect(picked._object).toBeDefined()
      expect(omitted._object).toBeDefined()
      expect(extended._object).toBeDefined()
    })
  })

  it('should test union validation directly', () => {
    const literals = [
      literal('one'),
      literal('two'),
      literal('three'),
    ]

    const unionType = union(literals)

    // Test literal validation
    expect(literal('two')._check?.('two')).toBe(true)
    expect(literal('two')._check?.('one')).toBe(false)

    // Test union validation
    expect(unionType._check?.('two')).toBe(true)
    expect(unionType._check?.('one')).toBe(true)
    expect(unionType._check?.('three')).toBe(true)
    expect(unionType._check?.('four')).toBe(false)

    // Debug the structure
    expect(unionType._union).toEqual(literals)
    expect(unionType.type).toBe('union')
  })
})
