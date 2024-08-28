import type { Type } from './schema'

export function isSchemaObject(schema: Type<any>): boolean {
  return schema._object != null
}

export function isSchemaOptional(schema: Type<any>): boolean {
  return schema._optional === true
}

export function isSchemaDefault(schema: Type<any>): boolean {
  return schema._default != null
}

export function isSchemaPrimitive(schema: Type<any>): boolean {
  return !isSchemaObject(schema) // todo
}

export function isSchemaObjectFlat(schema: Type<any>): boolean {
  return isSchemaObject(schema) && Object.values(schema._object!).every(isSchemaPrimitive as any) // todo
}
