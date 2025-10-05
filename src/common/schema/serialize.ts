// Serialization and Deserialization for Schema Types

import type { Type, TypeMeta } from './schema'
import { isArray, isFunction } from '../data/is'
import { any, array, boolean, func, int, literal, none, number, object, record, rpc, string, stringLiterals, tuple, union } from './schema'

// =============================================================================
// Types
// =============================================================================

/**
 * Plain JSON representation of a schema type
 */
export interface SerializedType {
  type: string
  default?: any
  optional?: boolean
  meta?: TypeMeta
  object?: Record<string, SerializedType>
  itemType?: SerializedType
  union?: SerializedType[]
  enumValues?: any[]
  args?: SerializedType[]
  ret?: SerializedType
  info?: SerializedType
  tupleTypes?: SerializedType[]
  literalValue?: any
}

// =============================================================================
// Serialization
// =============================================================================

/**
 * Serializes a schema Type to a plain JSON object.
 * Functions in _check and _default will not be serialized.
 *
 * @param schema - The schema Type to serialize
 * @returns A plain JSON object representing the schema
 */
export function serializeSchema(schema: Type<any>): SerializedType {
  const result: SerializedType = {
    type: schema.type,
  }

  if (schema._optional !== undefined) {
    result.optional = schema._optional
  }

  if (schema._meta !== undefined) {
    result.meta = schema._meta
  }

  // Serialize default value if it's not a function
  if (schema._default !== undefined && !isFunction(schema._default)) {
    result.default = schema._default
  }

  // Serialize object properties
  if (schema._object !== undefined) {
    result.object = {}
    for (const [key, value] of Object.entries(schema._object)) {
      result.object[key] = serializeSchema(value as Type<any>)
    }
  }

  // Serialize array/record item type
  if (schema._type !== undefined) {
    if (isArray(schema._type)) {
      // Tuple types
      result.tupleTypes = (schema._type as Type<any>[]).map(t => serializeSchema(t))
    }
    else {
      // Array or record item type
      result.itemType = serializeSchema(schema._type as Type<any>)
    }
  }

  // Serialize union types
  if (schema._union !== undefined) {
    result.union = (schema._union as Type<any>[]).map(t => serializeSchema(t))
  }

  // Serialize enum values
  if (schema._enumValues !== undefined) {
    result.enumValues = schema._enumValues
  }

  // Serialize function arguments
  if (schema._args !== undefined) {
    result.args = (schema._args as Type<any>[]).map(t => serializeSchema(t))
  }

  // Serialize function return type
  if (schema._ret !== undefined) {
    result.ret = serializeSchema(schema._ret as Type<any>)
  }

  // Serialize RPC info type
  if (schema._info !== undefined) {
    result.info = serializeSchema(schema._info as Type<any>)
  }

  // Serialize literal value (for literal types)
  if (schema.type === 'literal' && schema._default !== undefined) {
    result.literalValue = schema._default
  }

  return result
}

// =============================================================================
// Deserialization
// =============================================================================

/**
 * Deserializes a plain JSON object back to a schema Type.
 * Note: Custom _check functions cannot be restored and will use default validators.
 *
 * @param serialized - The serialized schema object
 * @returns A reconstructed Type instance
 */
export function deserializeSchema(serialized: SerializedType): Type<any> {
  let schema: Type<any>

  // Create base type based on type name
  switch (serialized.type) {
    case 'string':
      if (serialized.enumValues) {
        schema = stringLiterals(serialized.enumValues as any)
      }
      else {
        schema = string()
      }
      break
    case 'number':
      schema = number()
      break
    case 'int':
      schema = int()
      break
    case 'boolean':
      schema = boolean()
      break
    case 'none':
      schema = none()
      break
    case 'any':
      schema = any()
      break
    case 'object':
      if (serialized.object) {
        const obj: any = {}
        for (const [key, value] of Object.entries(serialized.object)) {
          obj[key] = deserializeSchema(value)
        }
        schema = object(obj)
      }
      else {
        schema = object({})
      }
      break
    case 'record':
      if (serialized.itemType) {
        schema = record(deserializeSchema(serialized.itemType))
      }
      else {
        schema = record(any())
      }
      break
    case 'array':
      if (serialized.itemType) {
        schema = array(deserializeSchema(serialized.itemType))
      }
      else {
        schema = array(any())
      }
      break
    case 'tuple':
      if (serialized.tupleTypes) {
        const types = serialized.tupleTypes.map(t => deserializeSchema(t))
        schema = tuple(types as any)
      }
      else {
        schema = tuple([])
      }
      break
    case 'union':
      if (serialized.union) {
        const types = serialized.union.map(t => deserializeSchema(t))
        schema = union(types as any)
      }
      else {
        schema = union([])
      }
      break
    case 'literal':
      if (serialized.literalValue !== undefined) {
        schema = literal(serialized.literalValue)
      }
      else {
        schema = any()
      }
      break
    case 'function':
      if (serialized.args && serialized.ret) {
        const args = serialized.args.map(t => deserializeSchema(t))
        const ret = deserializeSchema(serialized.ret)
        schema = func(args as any, ret)
      }
      else {
        schema = func([], any())
      }
      break
    case 'rpc':
      if (serialized.info && serialized.ret) {
        const info = deserializeSchema(serialized.info)
        const ret = deserializeSchema(serialized.ret)
        schema = rpc(info, ret)
      }
      else if (serialized.ret) {
        const ret = deserializeSchema(serialized.ret)
        schema = rpc(undefined, ret)
      }
      else {
        schema = rpc()
      }
      break
    default:
      // Unknown type, create a generic any() type
      schema = any()
      break
  }

  // Apply optional flag
  if (serialized.optional) {
    schema = schema.optional()
  }

  // Apply default value (only if not a function)
  if (serialized.default !== undefined) {
    schema = schema.default(serialized.default)
  }

  // Apply metadata
  if (serialized.meta) {
    schema = schema.meta(serialized.meta)
  }

  return schema
}
