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
  // allowExtra?: boolean
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
  }

  if (schema._object) {
    const newObj: any = {}
    for (const key in schema._object) {
      const propSchema = schema._object[key] as any
      const result = schemaParseObject(propSchema, obj[key] as any, {
        ...opt,
        path: opt?.path ? `${opt.path}.${key}` : key,
        messages,
      })
      if (result !== undefined) {
        newObj[key] = result
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
