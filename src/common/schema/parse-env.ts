import type { Type } from './schema'
import { assert } from '../assert'
import { fromCamelCase } from '../data/camelcase'
import { valueToBoolean, valueToBooleanNotFalse, valueToInteger } from '../data/convert'
import { objectMap } from '../data/object'
import { schemaParseObject } from './parse-object'
import { isSchemaObjectFlat } from './utils'

declare module './schema' {
  interface TypeMeta {
    envDesc?: string
    envPrivate?: boolean // will not be documented
    envSkip?: boolean // will not be included in env parsing
  }
}

export type SchemaEnvType = Record<string, any>

export interface SchemaEnvOptions<T> {
  existing?: Partial<T> // if true, will only parse existing env variables
  env?: SchemaEnvType
  prefix?: string
  prefixOptional?: boolean // if true, prefix is optional
}

export function parseSchemaEnv<T>(schema: Type<T>, opt?: SchemaEnvOptions<T>): T {
  assert(schema?._object, 'schema should be of type object')
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')

  const {
    // eslint-disable-next-line node/prefer-global/process
    env = (process?.env ?? {}) as SchemaEnvType,
    prefix = '',
    prefixOptional = false,
  } = opt ?? {}
  const pl = prefix.length
  const existing: any = opt?.existing ?? {}

  return objectMap(schema._object, (key, schema) => {
    const defaultValue = existing[key] ?? schema._default
    if (schema._meta?.envSkip)
      return defaultValue

    const envKey = fromCamelCase(key, '_').toUpperCase()
    const envKeyWithPrefix = prefix + fromCamelCase(key, '_').toUpperCase()

    let value: any = env[envKey]

    if (pl > 0) {
      if (prefixOptional === true) {
        value = env[envKeyWithPrefix] ?? value
      }
      else {
        value = env[envKeyWithPrefix]
      }
    }

    if (value === undefined) {
      return defaultValue
    }

    if (schema.type === 'number') {
      value = valueToInteger(value, schema._default)
    }
    else if (schema.type === 'boolean') {
      if (schema._default === true)
        value = valueToBooleanNotFalse(value)
      else
        value = valueToBoolean(value, false)
    }
    return schemaParseObject(schema, value)
  }) as T
}

export function stringFromSchemaEnv<T>(schema: Type<T>, prefix = '', commentOut = false, showPrivate = false): string {
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')
  const lines: string[] = []
  objectMap(schema._object!, (key, schema) => {
    if ((schema._meta?.envPrivate || schema._meta?.envSkip) && !showPrivate)
      return
    const desc = schema._meta?.envDesc ?? schema._meta?.desc
    if (desc) {
      desc.trim().split('\n').forEach((line: string) => {
        lines.push(`# ${line.trim()}`)
      })
    }
    lines.push(`${commentOut ? '# ' : ''}${prefix + fromCamelCase(key, '_').toUpperCase()}=${schema._default ?? ''}`)
    lines.push('')
  }) as T
  return lines.join('\n')
}
