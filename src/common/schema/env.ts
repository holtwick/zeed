import type { Type } from './schema'
import { assert } from '../assert'
import { fromCamelCase, toCamelCase } from '../data/camelcase'
import { valueToBoolean, valueToBooleanNotFalse, valueToInteger } from '../data/convert'
import { objectFilter, objectMap } from '../data/object'
import { isSchemaObjectFlat } from './utils'

// declare module './types' {
//   interface TypeProps {
//     argShort?: string
//   }
// }

// eslint-disable-next-line node/prefer-global/process
export function parseSchemaEnv<T>(schema: Type<T>, env: any = process?.env ?? {}, prefix = ''): T {
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')
  const pl = prefix.length
  if (pl > 0)
    env = objectFilter(env, key => key.startsWith(prefix))
  env = objectMap(env, (key, value) => {
    if (pl > 0)
      key = key.substring(pl)
    return [toCamelCase(key), value]
  })
  return objectMap(schema._object!, (key, schema) => {
    let value = env[toCamelCase(key)]
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

export function stringFromSchemaEnv<T>(schema: Type<T>, prefix = '', commentOut = false): string {
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')
  const lines: string[] = []
  objectMap(schema._object!, (key, schema) => {
    lines.push(`${commentOut ? '# ' : ''}${prefix + fromCamelCase(key, '_').toUpperCase()}=${schema._default ?? ''}`)
  }) as T
  return lines.join('\n')
}
