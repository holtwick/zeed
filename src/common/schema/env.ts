import { assert } from '../assert'
import { objectMap, valueToBoolean, valueToInteger } from '../data'
import { toCamelCase } from '../data/camelcase'
import type { Type } from './types'
import { isSchemaObjectFlat } from './utils'

// eslint-disable-next-line node/prefer-global/process
export function parseSchemaEnv<T>(schema: Type<T>, env: any = process?.env ?? {}): T {
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')
  const cenv = objectMap(env, (key, value) => [toCamelCase(key), value])
  return objectMap(schema._object!, (key, schema) => {
    let value = cenv[toCamelCase(key)]
    if (schema.type === 'number') {
      value = valueToInteger(value)
    }
    else if (schema.type === 'boolean') {
      value = valueToBoolean(value)
    }
    return schema.parse(value)
  }) as T
}
