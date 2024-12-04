import type { Type } from './schema'
import { assert } from '../assert'
import { objectMap } from '../data/object'
import { isSchemaObjectFlat } from './utils'

// declare module './schema' {
//   interface TypeProps {
//     argShort?: string
//     argDesc?: string
//   }
// }

const mapSwiftType = {
  string: 'String',
  number: 'Double',
  int: 'Int',
  boolean: 'Bool',
} as any

export function schemaExportSwiftStruct<T>(schema: Type<T>, name: string = 'Example'): string {
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')

  const lines: string[] = [
    `struct ${name} {`,
  ]

  objectMap(schema._object!, (key, schema: Type<any>) => {
    let s = `  var ${key}: ${mapSwiftType[schema.type] ?? schema.type}`
    if (schema._optional === true)
      s += '?'
    if (schema._default != null)
      s += ` = ${schema._default}`
    lines.push(s)
  })

  lines.push('}')

  return lines.join('\n')
}
