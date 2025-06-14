import type { Type } from './schema'
import { assert } from '../assert'
import { objectMap } from '../data/object'
import { isSchemaObjectFlat } from './utils'

const _mapJsonSchemaType: Record<string, string> = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  int: 'integer',
}

export function schemaExportJsonSchema<T>(schema: Type<T>): Record<string, any> {
  assert(isSchemaObjectFlat(schema), 'schema should be a flat object')

  function transformSchema(schema: Type<any>): any {
    const type = _mapJsonSchemaType[schema.type] ?? schema.type ?? 'object'
    const properties: Record<string, any> = {}
    const required: string[] = []

    objectMap(schema._object!, (key, schema: any) => {
      const type = _mapJsonSchemaType[schema.type] ?? schema.type
      properties[key] = { type }
      const enumValues = (schema as any)._enumValues
      if (enumValues) {
        properties[key].enum = enumValues
      }
      if (schema._default !== undefined) {
        properties[key].default = schema._default
      }
      if (schema._meta?.desc) {
        properties[key].description = schema._meta.desc
      }
      if (schema._optional !== true) {
        required.push(key)
      }
      if (schema.type === 'array' && schema._type) {
        properties[key].items = transformSchema(schema._type)
      }
      if (schema.type === 'object' && schema._object) {
        Object.assign(properties[key], transformSchema(schema._object))
      }
      // Handle union types (e.g., z.union)
      if (schema.type === 'union' && Array.isArray(schema._union)) {
        properties[key].type = schema._union.map((s: any) => _mapJsonSchemaType[s.type] ?? s.type) // todo complex types
      }
    })

    return {
      type,
      additionalProperties: false,
      properties,
      ...(required.length > 0 ? { required } : {}),
    }
  }

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    ...transformSchema(schema),
  }
}

export function schemaExportJsonSchemaString<T>(schema: Type<T>): string {
  const jsonSchema = schemaExportJsonSchema(schema)
  return JSON.stringify(jsonSchema, null, 2)
}
