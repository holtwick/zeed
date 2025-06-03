import type { Type } from './schema'
import { assert } from '../assert'
import { fromCamelCase } from '../data/camelcase'
import { valueToBoolean, valueToBooleanNotFalse, valueToInteger } from '../data/convert'
import { objectMap } from '../data/object'
import { isSchemaObjectFlat } from './utils'

declare module './schema' {
  interface TypeProps {
    envDesc?: string
    envPrivate?: boolean // will not be documented
  }
}

export type SchemaEnvType = Record<string, any>

export interface SchemaEnvOptions {
  env?: SchemaEnvType
  prefix?: string
  prefixOptional?: boolean // if true, prefix is optional
}

export function parseSchemaEnv<T>(schema: Type<T>, opt?: SchemaEnvOptions): T {
  assert(schema?._object, 'schema should be of type object')
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')

  const {
    // eslint-disable-next-line node/prefer-global/process
    env = (process?.env ?? {}) as SchemaEnvType,
    prefix = '',
    prefixOptional = false,
  } = opt ?? {}
  const pl = prefix.length

  return objectMap(schema._object, (key, schema) => {
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

    if (schema.type === 'number') {
      value = valueToInteger(value, schema._default)
    }
    else if (schema.type === 'boolean') {
      if (schema._default === true)
        value = valueToBooleanNotFalse(value)
      else
        value = valueToBoolean(value, false)
    }
    return schema.parse(value)
  }) as T
}

export function stringFromSchemaEnv<T>(schema: Type<T>, prefix = '', commentOut = false, showPrivate = false): string {
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')
  const lines: string[] = []
  objectMap(schema._object!, (key, schema) => {
    if (schema._props?.envPrivate && !showPrivate)
      return
    const desc = schema._props?.envDesc ?? schema._props?.desc
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
