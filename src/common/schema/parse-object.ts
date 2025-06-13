import type { Type } from './schema'
import { isFunction } from '../data'

export function createWithSchema<T>(schema: Type<T>): Partial<T> | undefined {
  if (schema._optional) {
    return undefined as any
  }
  if (schema._object) {
    const obj: any = {}
    for (const key in schema._object) {
      const propSchema = schema._object[key] as Type<any>
      if (propSchema._default !== undefined) {
        obj[key] = isFunction(propSchema._default) ? propSchema._default() : propSchema._default
      }
      else {
        obj[key] = undefined
      }
    }
    return obj
  }
  return undefined
}

export function parseSchema<T>(schema: Type<T>, obj: T): T {
  // return objectMap(schema._object, (key, schema) => {
  //   const defaultValue = existing[key] ?? schema._default
  //   if (schema._props?.envSkip)
  //     return defaultValue

  //   const envKey = fromCamelCase(key, '_').toUpperCase()
  //   const envKeyWithPrefix = prefix + fromCamelCase(key, '_').toUpperCase()

  //   let value: any = env[envKey]

  //   if (pl > 0) {
  //     if (prefixOptional === true) {
  //       value = env[envKeyWithPrefix] ?? value
  //     }
  //     else {
  //       value = env[envKeyWithPrefix]
  //     }
  //   }

  //   if (value === undefined) {
  //     return defaultValue
  //   }

  //   if (schema.type === 'number') {
  //     value = valueToInteger(value, schema._default)
  //   }
  //   else if (schema.type === 'boolean') {
  //     if (schema._default === true)
  //       value = valueToBooleanNotFalse(value)
  //     else
  //       value = valueToBoolean(value, false)
  //   }
  //   return schema.parse(value)
  // }) as T
}
