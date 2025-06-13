import type { Type } from './schema'
import { arrayMinus, isFunction } from '../data'

export function schemaCreateObject<T>(schema: Type<T>): Partial<T> | undefined {
  if (schema._default !== undefined) {
    return isFunction(schema._default) ? schema._default() : schema._default
  }

  if (schema._optional) {
    return undefined as any
  }

  if (schema._object) {
    const obj: any = {}
    for (const key in schema._object) {
      obj[key] = schemaCreateObject(schema._object[key] as Type<any>)
    }
    return obj
  }

  return undefined
}

interface SchemaValidateMessage {
  path: string
  message: string
  type: string
  valid: boolean
}

export function schemaValidateObject<T>(schema: Type<T>, obj?: any, opt?: {
  path?: string
  messages?: SchemaValidateMessage[]
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
    const schemaKeys = Object.keys(schema._object)
    const objKeys = Object.keys(obj || {})
    const missingKeys = arrayMinus(schemaKeys, objKeys)

    if (missingKeys.length > 0) {
      return addMessage(`Missing properties: ${missingKeys.join(', ')}`, false)
    }

    for (const key in schema._object) {
      const propSchema = schema._object[key] as any
      if (!schemaValidateObject(
        propSchema,
        obj[key] as any,
        {
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
    const schemaKeys = Object.keys(schema._object)
    const objKeys = Object.keys(obj || {})
    const missingKeys = arrayMinus(schemaKeys, objKeys)

    if (missingKeys.length > 0) {
      return addMessage(`Missing properties: ${missingKeys.join(', ')}`, false)
    }

    for (const key in schema._object) {
      const propSchema = schema._object[key] as any
      if (!schemaValidateObject(
        propSchema,
        obj[key] as any,
        {
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
