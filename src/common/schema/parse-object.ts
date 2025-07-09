import type { Type } from './schema'
import { arrayMinus, isFunction, valueToBoolean, valueToFloat, valueToInteger, valueToString } from '../data'

export function schemaCreateObject<T>(schema: Type<T>): Partial<T> | undefined {
  if (schema._default !== undefined) {
    return isFunction(schema._default) ? schema._default(schema) : schema._default
  }

  if (schema._optional) {
    return undefined as any
  }

  if (schema._object) {
    const obj: any = {}
    for (const key in schema._object) {
      const propSchema = schema._object[key] as Type<any>
      const value = schemaCreateObject(propSchema)
      if (value !== undefined) {
        obj[key] = value
      }
    }
    return obj
  }

  // For non-optional, non-object types without defaults, return undefined
  // This allows the object creation to handle missing required fields appropriately
  return undefined
}

/**
 * Message for schema validation results.
 * @category Schema
 */
export interface SchemaValidateMessage {
  path: string
  message: string
  type: string
  valid: boolean
}

export function schemaValidateObject<T>(schema: Type<T>, obj?: any, opt?: {
  path?: string
  messages?: SchemaValidateMessage[]
  allowExtra?: boolean
}): boolean {
  const messages = opt?.messages || []

  function addMessage(message: string, valid: boolean = false) {
    messages.push({ path: `.${opt?.path ?? ''}`, message, valid, type: schema.type })
    return valid
  }

  if (obj == null && schema._optional) {
    return addMessage('Optional', true)
  }

  if (schema._object) {
    if (opt?.allowExtra !== true) {
      const schemaKeys = Object.keys(schema._object)
      const objKeys = Object.keys(obj || {})
      const missingKeys = arrayMinus(objKeys, schemaKeys)
      if (missingKeys.length > 0) {
        return addMessage(`Extra properties: ${missingKeys.join(', ')}`, false)
      }
    }

    for (const key in schema._object) {
      const propSchema = schema._object[key] as any
      if (!schemaValidateObject(
        propSchema,
        obj[key] as any,
        {
          ...opt,
          path: opt?.path ? `${opt.path}.${key}` : key,
          messages,
        },
      )) {
        return addMessage(`Invalid property '${key}'`, false)
      }
    }
    return addMessage('Object valid', true)
  }

  if (isFunction(schema._check)) {
    const checkResult = schema._check(obj)
    return addMessage('Check', checkResult)
  }

  return addMessage('Primitive valid', false)
}

export function schemaParseObject<T>(schema: Type<T>, obj?: any, opt?: {
  path?: string
  messages?: SchemaValidateMessage[]

  /// Whether to allow extra properties not defined in the schema
  allowExtra?: boolean
}): T | undefined {
  const messages = opt?.messages || []

  function addMessage(message: string, valid: boolean = false) {
    messages.push({ path: `.${opt?.path ?? ''}`, message, valid, type: schema.type })
    // console.debug({ path: `.${opt?.path ?? ''}`, message, valid, type: schema.type }, obj)
    return valid
  }

  if (obj == null) {
    if (schema._optional) {
      addMessage('Optional', true)
      return undefined
    }
    if (schema._default !== undefined) {
      addMessage('Default', true)
      return isFunction(schema._default) ? schema._default(schema) : schema._default
    }
    // For non-optional objects without explicit defaults, use empty object
    if (schema._object) {
      obj = {}
    }
  }

  if (schema._object) {
    const newObj: any = {}
    const shape = schema._object
    for (const key in shape) {
      const propSchema = shape[key] as any
      const result = schemaParseObject(propSchema, obj[key] as any, {
        ...opt,
        path: opt?.path ? `${opt.path}.${key}` : key,
        messages,
      })
      if (result !== undefined) {
        newObj[key] = result
      }
      else if (propSchema._default !== undefined) {
        newObj[key] = isFunction(propSchema._default) ? propSchema._default(propSchema) : propSchema._default
      }
      else if (propSchema._optional) {
        // Only set undefined for optional properties if they were explicitly provided as undefined
        if (obj && typeof obj === 'object' && key in obj) {
          newObj[key] = undefined
        }
        // Otherwise, don't set the property at all
      }
      // For required properties without defaults, don't set undefined - leave them missing
    }

    // Add extra properties if allowExtra is enabled
    if (opt?.allowExtra && obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        if (!(key in shape)) {
          newObj[key] = value
        }
      }
    }

    return newObj
  }

  if (obj != null) {
    if (schema.type === 'string') {
      obj = valueToString(obj)
    }
    else if (schema.type === 'boolean') {
      obj = valueToBoolean(obj)
    }
    else if (schema.type === 'number') {
      obj = valueToFloat(obj)
      if (Number.isNaN(obj)) {
        addMessage(`Invalid number: ${obj}`, false)
        return undefined
      }
    }
    else if (schema.type === 'int') {
      obj = valueToInteger(obj)
      if (Number.isNaN(obj)) {
        addMessage(`Invalid number: ${obj}`, false)
        return undefined
      }
    }
  }

  if (isFunction(schema._check)) {
    const checkResult = schema._check(obj)
    addMessage('Check', checkResult)
    return checkResult ? obj : undefined
  }

  return obj
}
