import type { Type } from './schema'
import { assert } from '../assert'
import { fromCamelCase, toCamelCase } from '../data/camelcase'
import { valueToInteger } from '../data/convert'
import { objectMap } from '../data/object'
import { schemaParseObject } from './parse-object'
import { isSchemaObjectFlat } from './utils'

declare module './schema' {
  interface TypeMeta {
    argShort?: string
    argDesc?: string
  }
}

// eslint-disable-next-line node/prefer-global/process
export function parseSchemaArgs<T>(schema: Type<T>, args: any = process?.argv ?? {}): [T, string[]] {
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')

  const alias: Record<string, string> = {}
  const booleanArgs: string[] = []

  objectMap(schema._object!, (key, schema: Type<any>) => {
    if (schema._meta?.argShort)
      alias[toCamelCase(schema._meta.argShort)] = toCamelCase(key)
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
    if (schema.type === 'number' && value != null) {
      value = valueToInteger(value)
    }
    return schemaParseObject(schema, value)
  }) as T

  return [argsResult, names]
}

export function helpSchemaArgs<T>(schema: Type<T>): string {
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')

  const lines: string[] = []

  objectMap(schema._object!, (key, schema: Type<any>) => {
    let s = `--${fromCamelCase(key)}`
    if (schema._meta?.argShort)
      s += `, -${fromCamelCase(schema._meta.argShort)}`
    if (schema.type !== 'boolean')
      s += `=${schema.type}`
    lines.push(s)
    const desc = schema._meta?.argDesc ?? schema._meta?.desc
    if (desc)
      lines.push(`  ${desc}`)
  })

  return lines.join('\n')
}
