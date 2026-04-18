import type { Type } from './schema'
import { isEmpty } from '../data'

const _primitiveMap: Record<string, string> = {
  string: 'string',
  number: 'number',
  int: 'integer',
  boolean: 'boolean',
}

function transformSchema(schema: Type<any>): Record<string, any> {
  const out: Record<string, any> = {}

  if (schema._enumValues) {
    out.type = _primitiveMap[schema.type] ?? schema.type
    out.enum = [...schema._enumValues]
  }
  else if (schema.type === 'literal') {
    out.const = schema._default
  }
  else if (schema.type === 'union' && Array.isArray(schema._union)) {
    out.anyOf = schema._union.map((s: Type<any>) => transformSchema(s))
  }
  else if (schema.type === 'object' && schema._object) {
    out.type = 'object'
    const properties: Record<string, any> = {}
    const required: string[] = []
    for (const key of Object.keys(schema._object)) {
      const propSchema = schema._object[key] as Type<any>
      properties[key] = transformSchema(propSchema)
      if (propSchema._optional !== true)
        required.push(key)
    }
    if (!isEmpty(properties))
      out.properties = properties
    out.additionalProperties = false
    if (required.length > 0)
      out.required = required
  }
  else if (schema.type === 'record' && schema._type) {
    out.type = 'object'
    out.additionalProperties = transformSchema(schema._type)
  }
  else if (schema.type === 'array' && schema._type) {
    out.type = 'array'
    out.items = transformSchema(schema._type)
  }
  else if (schema.type === 'tuple' && Array.isArray(schema._type)) {
    out.type = 'array'
    out.items = (schema._type as Type<any>[]).map(s => transformSchema(s))
    out.minItems = schema._type.length
    out.maxItems = schema._type.length
  }
  else if (schema.type === 'none') {
    out.type = 'null'
  }
  else if (schema.type === 'any') {
    // no constraint
  }
  else {
    const t = _primitiveMap[schema.type]
    if (t)
      out.type = t
  }

  if (schema._default !== undefined && schema.type !== 'literal')
    out.default = schema._default
  if (schema._meta?.desc)
    out.description = schema._meta.desc

  return out
}

export function schemaExportJsonSchema<T>(schema: Type<T>): Record<string, any> {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    ...transformSchema(schema),
  }
}

export function schemaExportJsonSchemaString<T>(schema: Type<T>): string {
  const jsonSchema = schemaExportJsonSchema(schema)
  return JSON.stringify(jsonSchema, null, 2)
}
