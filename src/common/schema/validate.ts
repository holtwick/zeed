import type { Type } from './schema'
import type { StandardSchemaV1 } from './standard-schema'
import { isArray, isFunction, isObject } from '../data/is'

/**
 * Validates a value against a zeed schema and returns a Standard Schema compliant result
 */
export function validateValue<T>(
  schema: Type<T>,
  value: unknown,
  path: PropertyKey[] = [],
): StandardSchemaV1.Result<T> {
  const issues: StandardSchemaV1.Issue[] = []

  // Handle optional values
  if (value == null && schema._optional) {
    return { value: value as T }
  }

  // Handle default values
  if (value === undefined && schema._default !== undefined) {
    const defaultValue = isFunction(schema._default)
      ? schema._default(schema)
      : schema._default
    return { value: defaultValue as T }
  }

  // Handle object schemas
  if (schema._object) {
    if (!isObject(value)) {
      issues.push({
        message: `Expected object, received ${typeof value}`,
        path: path.length > 0 ? path : undefined,
      })
      return { issues }
    }

    const result: any = {}
    let hasError = false

    for (const key in schema._object) {
      const propSchema = schema._object[key] as Type<any>
      const propValue = (value as any)[key]
      const propResult = validateValue(propSchema, propValue, [...path, key])

      if (propResult.issues) {
        issues.push(...propResult.issues)
        hasError = true
      }
      else {
        result[key] = propResult.value
      }
    }

    if (hasError) {
      return { issues }
    }

    return { value: result as T }
  }

  // Handle array schemas
  if (schema.type === 'array' && schema._type) {
    if (!isArray(value)) {
      issues.push({
        message: `Expected array, received ${typeof value}`,
        path: path.length > 0 ? path : undefined,
      })
      return { issues }
    }

    const result: any[] = []
    let hasError = false

    for (let i = 0; i < value.length; i++) {
      const itemResult = validateValue(schema._type, value[i], [...path, i])
      if (itemResult.issues) {
        issues.push(...itemResult.issues)
        hasError = true
      }
      else {
        result.push(itemResult.value)
      }
    }

    if (hasError) {
      return { issues }
    }

    return { value: result as T }
  }

  // Handle tuple schemas
  if (schema.type === 'tuple' && schema._type) {
    if (!isArray(value)) {
      issues.push({
        message: `Expected tuple, received ${typeof value}`,
        path: path.length > 0 ? path : undefined,
      })
      return { issues }
    }

    const items = schema._type as Type<any>[]
    if (value.length !== items.length) {
      issues.push({
        message: `Expected tuple of length ${items.length}, received ${value.length}`,
        path: path.length > 0 ? path : undefined,
      })
      return { issues }
    }

    const result: any[] = []
    let hasError = false

    for (let i = 0; i < items.length; i++) {
      const itemResult = validateValue(items[i], value[i], [...path, i])
      if (itemResult.issues) {
        issues.push(...itemResult.issues)
        hasError = true
      }
      else {
        result.push(itemResult.value)
      }
    }

    if (hasError) {
      return { issues }
    }

    return { value: result as T }
  }

  // Handle record schemas
  if (schema.type === 'record' && schema._type) {
    if (!isObject(value)) {
      issues.push({
        message: `Expected record, received ${typeof value}`,
        path: path.length > 0 ? path : undefined,
      })
      return { issues }
    }

    const result: any = {}
    let hasError = false

    for (const key in value) {
      const propResult = validateValue(schema._type, (value as any)[key], [...path, key])
      if (propResult.issues) {
        issues.push(...propResult.issues)
        hasError = true
      }
      else {
        result[key] = propResult.value
      }
    }

    if (hasError) {
      return { issues }
    }

    return { value: result as T }
  }

  // Handle union schemas
  if (schema._union) {
    const unionTypes = schema._union as Type<any>[]
    for (const unionType of unionTypes) {
      const unionResult = validateValue(unionType, value, path)
      if (!unionResult.issues) {
        return unionResult
      }
    }

    issues.push({
      message: `Value does not match any union type`,
      path: path.length > 0 ? path : undefined,
    })
    return { issues }
  }

  // Handle literal schemas
  if (schema.type === 'literal' && schema._default !== undefined) {
    if (value !== schema._default) {
      issues.push({
        message: `Expected literal value ${JSON.stringify(schema._default)}, received ${JSON.stringify(value)}`,
        path: path.length > 0 ? path : undefined,
      })
      return { issues }
    }
    return { value: value as T }
  }

  // Handle enum (string literals) schemas
  if (schema._enumValues) {
    const enumValues = schema._enumValues as readonly any[]
    if (!enumValues.includes(value)) {
      issues.push({
        message: `Expected one of ${enumValues.map(v => JSON.stringify(v)).join(', ')}, received ${JSON.stringify(value)}`,
        path: path.length > 0 ? path : undefined,
      })
      return { issues }
    }
    return { value: value as T }
  }

  // Handle primitive type checks
  if (schema._check) {
    if (!schema._check(value)) {
      const typeName = schema.type || 'unknown'
      issues.push({
        message: `Expected ${typeName}, received ${typeof value}`,
        path: path.length > 0 ? path : undefined,
      })
      return { issues }
    }
    return { value: value as T }
  }

  // If no check function, assume valid (for any type, etc.)
  return { value: value as T }
}
