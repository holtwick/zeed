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

const mapTypescriptType = {
  int: 'number',
} as any

export function schemaExportTypescriptInterface<T>(schema: Type<T>, name: string = 'Example'): string {
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')

  const lines: string[] = [
    `interface ${name} {`,
  ]

  objectMap(schema._object!, (key, schema: Type<any>) => {
    const s = `  ${key}${schema._optional === true ? '?' : ''}: ${mapTypescriptType[schema.type] ?? schema.type}`
    // if (schema._default != null)
    //   s += ` = ${schema._default}`
    lines.push(s)
  })

  lines.push('}')

  return lines.join('\n')
}
