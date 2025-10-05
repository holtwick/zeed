import { uuid } from '../uuid'
import { any, array, boolean, func, int, literal, number, object, record, rpc, string, stringLiterals, tuple, union } from './schema'
import { deserializeSchema, serializeSchema } from './serialize'
import { z } from './z'

describe('serialize', () => {
  it('should serialize and deserialize primitive types', () => {
    // String
    const strSchema = string()
    const strSerialized = serializeSchema(strSchema)
    expect(strSerialized).toEqual({ type: 'string' })
    const strDeserialized = deserializeSchema(strSerialized)
    expect(strDeserialized.type).toBe('string')
    expect(strDeserialized._check?.('test')).toBe(true)
    expect(strDeserialized._check?.(123)).toBe(false)

    // Number
    const numSchema = number()
    const numSerialized = serializeSchema(numSchema)
    expect(numSerialized).toEqual({ type: 'number' })
    const numDeserialized = deserializeSchema(numSerialized)
    expect(numDeserialized.type).toBe('number')
    expect(numDeserialized._check?.(123)).toBe(true)
    expect(numDeserialized._check?.('test')).toBe(false)

    // Integer
    const intSchema = int()
    const intSerialized = serializeSchema(intSchema)
    expect(intSerialized).toEqual({ type: 'int' })
    const intDeserialized = deserializeSchema(intSerialized)
    expect(intDeserialized.type).toBe('int')
    expect(intDeserialized._check?.(123)).toBe(true)
    expect(intDeserialized._check?.(123.45)).toBe(false)

    // Boolean
    const boolSchema = boolean()
    const boolSerialized = serializeSchema(boolSchema)
    expect(boolSerialized).toEqual({ type: 'boolean' })
    const boolDeserialized = deserializeSchema(boolSerialized)
    expect(boolDeserialized.type).toBe('boolean')
    expect(boolDeserialized._check?.(true)).toBe(true)
    expect(boolDeserialized._check?.('true')).toBe(false)

    // Any
    const anySchema = any()
    const anySerialized = serializeSchema(anySchema)
    expect(anySerialized).toEqual({ type: 'any' })
    const anyDeserialized = deserializeSchema(anySerialized)
    expect(anyDeserialized.type).toBe('any')
    expect(anyDeserialized._check?.('anything')).toBe(true)
    expect(anyDeserialized._check?.(123)).toBe(true)

    // None
    const noneSchema = z.none()
    const noneSerialized = serializeSchema(noneSchema)
    expect(noneSerialized).toEqual({ type: 'none', optional: true })
    const noneDeserialized = deserializeSchema(noneSerialized)
    expect(noneDeserialized.type).toBe('none')
    expect(noneDeserialized._optional).toBe(true)
  })

  it('should serialize and deserialize optional and default values', () => {
    // Optional
    const optSchema = string().optional()
    const optSerialized = serializeSchema(optSchema)
    expect(optSerialized).toEqual({ type: 'string', optional: true })
    const optDeserialized = deserializeSchema(optSerialized)
    expect(optDeserialized._optional).toBe(true)

    // Default value
    const defSchema = string().default('hello')
    const defSerialized = serializeSchema(defSchema)
    expect(defSerialized).toEqual({ type: 'string', default: 'hello' })
    const defDeserialized = deserializeSchema(defSerialized)
    expect(defDeserialized._default).toBe('hello')

    // Both optional and default
    const bothSchema = number().optional().default(42)
    const bothSerialized = serializeSchema(bothSchema)
    expect(bothSerialized).toEqual({ type: 'number', optional: true, default: 42 })
    const bothDeserialized = deserializeSchema(bothSerialized)
    expect(bothDeserialized._optional).toBe(true)
    expect(bothDeserialized._default).toBe(42)
  })

  it('should serialize and deserialize metadata', () => {
    const metaSchema = string().describe('User name')
    const metaSerialized = serializeSchema(metaSchema)
    expect(metaSerialized).toEqual({
      type: 'string',
      meta: { desc: 'User name' },
    })
    const metaDeserialized = deserializeSchema(metaSerialized)
    expect(metaDeserialized._meta).toEqual({ desc: 'User name' })
  })

  it('should serialize and deserialize object schemas', () => {
    const objSchema = object({
      name: string(),
      age: int().optional(),
      active: boolean().default(true),
    })

    const objSerialized = serializeSchema(objSchema)
    expect(objSerialized).toEqual({
      type: 'object',
      object: {
        name: { type: 'string' },
        age: { type: 'int', optional: true },
        active: { type: 'boolean', default: true },
      },
    })

    const objDeserialized = deserializeSchema(objSerialized)
    expect(objDeserialized.type).toBe('object')
    expect(objDeserialized._object).toBeDefined()
    expect(objDeserialized._object.name.type).toBe('string')
    expect(objDeserialized._object.age._optional).toBe(true)
    expect(objDeserialized._object.active._default).toBe(true)
  })

  it('should serialize and deserialize nested objects', () => {
    const nestedSchema = object({
      user: object({
        name: string(),
        details: object({
          age: int(),
          email: string().optional(),
        }),
      }),
    })

    const nestedSerialized = serializeSchema(nestedSchema)
    expect(nestedSerialized).toEqual({
      type: 'object',
      object: {
        user: {
          type: 'object',
          object: {
            name: { type: 'string' },
            details: {
              type: 'object',
              object: {
                age: { type: 'int' },
                email: { type: 'string', optional: true },
              },
            },
          },
        },
      },
    })

    const nestedDeserialized = deserializeSchema(nestedSerialized)
    expect(nestedDeserialized._object.user._object.details._object.age.type).toBe('int')
    expect(nestedDeserialized._object.user._object.details._object.email._optional).toBe(true)
  })

  it('should serialize and deserialize array schemas', () => {
    const arrSchema = array(string())
    const arrSerialized = serializeSchema(arrSchema)
    expect(arrSerialized).toEqual({
      type: 'array',
      itemType: { type: 'string' },
    })

    const arrDeserialized = deserializeSchema(arrSerialized)
    expect(arrDeserialized.type).toBe('array')
    expect(arrDeserialized._type.type).toBe('string')
  })

  it('should serialize and deserialize record schemas', () => {
    const recSchema = record(number())
    const recSerialized = serializeSchema(recSchema)
    expect(recSerialized).toEqual({
      type: 'record',
      itemType: { type: 'number' },
    })

    const recDeserialized = deserializeSchema(recSerialized)
    expect(recDeserialized.type).toBe('record')
    expect(recDeserialized._type.type).toBe('number')
  })

  it('should serialize and deserialize tuple schemas', () => {
    const tupSchema = tuple([string(), number(), boolean()])
    const tupSerialized = serializeSchema(tupSchema)
    expect(tupSerialized).toEqual({
      type: 'tuple',
      tupleTypes: [
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' },
      ],
    })

    const tupDeserialized = deserializeSchema(tupSerialized)
    expect(tupDeserialized.type).toBe('tuple')
    expect(tupDeserialized._type).toHaveLength(3)
    expect(tupDeserialized._type[0].type).toBe('string')
    expect(tupDeserialized._type[1].type).toBe('number')
    expect(tupDeserialized._type[2].type).toBe('boolean')
  })

  it('should serialize and deserialize union schemas', () => {
    const uniSchema = union([string(), number(), boolean()])
    const uniSerialized = serializeSchema(uniSchema)
    expect(uniSerialized).toEqual({
      type: 'union',
      union: [
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' },
      ],
    })

    const uniDeserialized = deserializeSchema(uniSerialized)
    expect(uniDeserialized.type).toBe('union')
    expect(uniDeserialized._union).toHaveLength(3)
    expect(uniDeserialized._union[0].type).toBe('string')
  })

  it('should serialize and deserialize literal schemas', () => {
    // String literal
    const litStrSchema = literal('hello')
    const litStrSerialized = serializeSchema(litStrSchema)
    expect(litStrSerialized).toEqual({
      type: 'literal',
      default: 'hello',
      literalValue: 'hello',
    })
    const litStrDeserialized = deserializeSchema(litStrSerialized)
    expect(litStrDeserialized.type).toBe('literal')
    expect(litStrDeserialized._default).toBe('hello')

    // Number literal
    const litNumSchema = literal(42)
    const litNumSerialized = serializeSchema(litNumSchema)
    expect(litNumSerialized).toEqual({
      type: 'literal',
      default: 42,
      literalValue: 42,
    })
    const litNumDeserialized = deserializeSchema(litNumSerialized)
    expect(litNumDeserialized._default).toBe(42)

    // Boolean literal
    const litBoolSchema = literal(true)
    const litBoolSerialized = serializeSchema(litBoolSchema)
    expect(litBoolSerialized).toEqual({
      type: 'literal',
      default: true,
      literalValue: true,
    })
    const litBoolDeserialized = deserializeSchema(litBoolSerialized)
    expect(litBoolDeserialized._default).toBe(true)
  })

  it('should serialize and deserialize string literal unions', () => {
    const strLitSchema = stringLiterals(['active', 'inactive', 'pending'])
    const strLitSerialized = serializeSchema(strLitSchema)
    expect(strLitSerialized).toEqual({
      type: 'string',
      enumValues: ['active', 'inactive', 'pending'],
    })

    const strLitDeserialized = deserializeSchema(strLitSerialized)
    expect(strLitDeserialized.type).toBe('string')
    expect(strLitDeserialized._enumValues).toEqual(['active', 'inactive', 'pending'])
    expect(strLitDeserialized._check?.('active')).toBe(true)
    expect(strLitDeserialized._check?.('invalid')).toBe(false)
  })

  it('should serialize and deserialize complex nested schemas', () => {
    const complexSchema = object({
      id: string().default('auto'),
      status: stringLiterals(['active', 'inactive']),
      metadata: object({
        tags: array(string()).optional(),
        counts: record(number()),
      }).optional(),
      coords: tuple([number(), number()]),
      value: union([string(), number()]),
    })

    const serialized = serializeSchema(complexSchema)
    const deserialized = deserializeSchema(serialized)

    // Verify structure is preserved
    expect(deserialized.type).toBe('object')
    expect(deserialized._object.id._default).toBe('auto')
    expect(deserialized._object.status._enumValues).toEqual(['active', 'inactive'])
    expect(deserialized._object.metadata._optional).toBe(true)
    expect(deserialized._object.metadata._object.tags.type).toBe('array')
    expect(deserialized._object.metadata._object.counts.type).toBe('record')
    expect(deserialized._object.coords.type).toBe('tuple')
    expect(deserialized._object.coords._type).toHaveLength(2)
    expect(deserialized._object.value.type).toBe('union')
    expect(deserialized._object.value._union).toHaveLength(2)
  })

  it('should serialize and deserialize function schemas', () => {
    const funcSchema = func([string(), number()], boolean())
    const funcSerialized = serializeSchema(funcSchema)
    expect(funcSerialized).toEqual({
      type: 'function',
      args: [
        { type: 'string' },
        { type: 'number' },
      ],
      ret: { type: 'boolean' },
    })

    const funcDeserialized = deserializeSchema(funcSerialized)
    expect(funcDeserialized.type).toBe('function')
    expect(funcDeserialized._args).toHaveLength(2)
    expect(funcDeserialized._args[0].type).toBe('string')
    expect(funcDeserialized._ret.type).toBe('boolean')
  })

  it('should serialize and deserialize rpc schemas', () => {
    // RPC with info and return type
    const rpcSchema = rpc(object({ id: string() }), object({ success: boolean() }))
    const rpcSerialized = serializeSchema(rpcSchema)
    expect(rpcSerialized).toEqual({
      type: 'rpc',
      info: {
        type: 'object',
        object: {
          id: { type: 'string' },
        },
      },
      ret: {
        type: 'object',
        object: {
          success: { type: 'boolean' },
        },
      },
    })

    const rpcDeserialized = deserializeSchema(rpcSerialized)
    expect(rpcDeserialized.type).toBe('rpc')
    expect(rpcDeserialized._info.type).toBe('object')
    expect(rpcDeserialized._ret.type).toBe('object')

    // RPC without info
    const rpcNoInfoSchema = rpc(undefined, string())
    const rpcNoInfoSerialized = serializeSchema(rpcNoInfoSchema)
    expect(rpcNoInfoSerialized.ret?.type).toBe('string')
  })

  it('should handle round-trip serialization', () => {
    const originalSchema = object({
      id: string().default(uuid()),
      name: string().describe('User name'),
      age: int().optional(),
      tags: array(string()),
      metadata: record(any()),
      status: stringLiterals(['active', 'inactive']),
      coords: tuple([number(), number()]),
    })

    // Serialize
    const serialized = serializeSchema(originalSchema)

    // Deserialize
    const deserialized = deserializeSchema(serialized)

    // Verify structure matches
    expect(deserialized.type).toBe('object')
    expect(deserialized._object.name._meta?.desc).toBe('User name')
    expect(deserialized._object.age._optional).toBe(true)
    expect(deserialized._object.tags.type).toBe('array')
    expect(deserialized._object.metadata.type).toBe('record')
    expect(deserialized._object.status._enumValues).toEqual(['active', 'inactive'])
    expect(deserialized._object.coords._type).toHaveLength(2)

    // Re-serialize to verify consistency
    const reserialized = serializeSchema(deserialized)

    // Remove the dynamic uuid default for comparison
    delete (serialized as any).object.id.default
    delete (reserialized as any).object.id.default

    expect(reserialized).toEqual(serialized)
  })

  it('should not serialize function defaults', () => {
    const schemaWithFuncDefault = string().default(() => 'computed')
    const serialized = serializeSchema(schemaWithFuncDefault)

    // Function defaults should not be serialized
    expect(serialized.default).toBeUndefined()
  })
})
