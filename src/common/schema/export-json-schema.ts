import type { Type } from './schema'
import { assert } from '../assert'
import { objectMap } from '../data/object'
import { isSchemaObjectFlat } from './utils'

const _mapJsonSchemaType: Record<string, string> = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  int: 'integer',
  // Add more type mappings as needed
}

export function schemaExportJsonSchema<T>(schema: Type<T>, name: string = 'Example'): string {
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')

  const properties: Record<string, any> = {}
  const required: string[] = []

  objectMap(schema._object!, (key, schema: Type<any>) => {
    properties[key] = {
      type: _mapJsonSchemaType[schema.type] ?? schema.type,
    }
    const enumValues = (schema as any)._enumValues
    if (enumValues) {
      properties[key].enum = enumValues
    }
    if (schema._default !== undefined) {
      properties[key].default = schema._default
    }
    if (schema._props?.desc) {
      properties[key].description = schema._props.desc
    }
    if (schema._optional !== true) {
      required.push(key)
    }
  })

  const jsonSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: name,
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
  }

  return JSON.stringify(jsonSchema, null, 2)
}
