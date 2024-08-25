import { assert } from '../assert'
import { objectMap, valueToInteger } from '../data'
import { toCamelCase } from '../data/camelcase'
import type { Type } from './types'
import { isSchemaObjectFlat } from './utils'

declare module './types' {
  interface TypeProps {
    argShort?: string
  }
}

// eslint-disable-next-line node/prefer-global/process
export function parseSchemaArgs<T>(schema: Type<T>, args: any = process?.argv ?? {}): [T, string[]] {
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')

  const alias: Record<string, string> = {}
  const booleanArgs: string[] = []

  objectMap(schema._object!, (key, schema: Type<any>) => {
    if (schema._props?.argShort)
      alias[toCamelCase(schema._props.argShort)] = toCamelCase(key)
    if (schema.type === 'boolean') {
      booleanArgs.push(toCamelCase(key))
    }
  })

  const argList = [...args]
  let arg: string | undefined
  const names: string[] = []
  const argsObj: Record<string, any> = {}

  // eslint-disable-next-line no-cond-assign
  while ((arg = argList.shift())) {
    let value: any
    if (/^--?/.test(arg)) {
      let key = arg.replace(/^--?/, '')
      if (arg.includes('=')) {
        const [name, valuePart] = key.split('=', 2)
        key = name.trim()
        value = valuePart.trim()
      }
      key = toCamelCase(key)
      key = alias[key] ?? key
      if (booleanArgs.includes(key)) {
        argsObj[key] = true
      }
      else {
        value = value ?? argList.shift() ?? ''
        argsObj[key] = value
      }
    }
    else {
      names.push(arg)
    }
  }

  const argsResult = objectMap(schema._object!, (key, schema) => {
    let value = argsObj[toCamelCase(key)]
    if (schema.type === 'number') {
      value = valueToInteger(value)
    }
    return schema.parse(value)
  }) as T

  return [argsResult, names]
}
