import type { Infer } from './schema'
import { schemaExportJsonSchema } from './export-json-schema'
import { z } from './z'

describe('json-schema.spec', () => {
  it('parse args', async () => {
    const schema = z.object({
      fixed: z.enum(['a', 'b', 'c']).describe('This is a fixed value'),
      anInt: z.int().optional().default(0),
      aBool: z.boolean().describe('This is a boolean'),
      aNumber: z.number().meta({
        desc: 'This is a number',
      }),
      aRecord: z.record(z.number()),
      moreRecords: z.record(z.object({ x: z.string() })).optional(),
      anObject: z.object({
        a: z.string(),
        b: z.number(),
      }),
      aString: z.string(),
    })

    type tInfer = Infer<typeof schema>

    expectTypeOf<tInfer>().toMatchObjectType<{
      anInt?: number | undefined
      moreRecords?: Record<string, {
        x: string
      }> | undefined
      fixed: 'a' | 'b' | 'c'
      aBool: boolean
      aNumber: number
      aRecord: Record<string, number>
      anObject: {
        a: string
        b: number
      }
      aString: string
    }>()

    const r = schemaExportJsonSchema(schema)

    expect(r).toMatchInlineSnapshot(`
      Object {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "additionalProperties": false,
        "properties": Object {
          "aBool": Object {
            "description": "This is a boolean",
            "type": "boolean",
          },
          "aNumber": Object {
            "description": "This is a number",
            "type": "number",
          },
          "aRecord": Object {
            "additionalProperties": Object {
              "type": "number",
            },
            "type": "object",
          },
          "aString": Object {
            "type": "string",
          },
          "anInt": Object {
            "default": 0,
            "type": "integer",
          },
          "anObject": Object {
            "additionalProperties": false,
            "properties": Object {
              "a": Object {
                "type": "string",
              },
              "b": Object {
                "type": "number",
              },
            },
            "required": Array [
              "a",
              "b",
            ],
            "type": "object",
          },
          "fixed": Object {
            "description": "This is a fixed value",
            "enum": Array [
              "a",
              "b",
              "c",
            ],
            "type": "string",
          },
          "moreRecords": Object {
            "additionalProperties": Object {
              "additionalProperties": false,
              "properties": Object {
                "x": Object {
                  "type": "string",
                },
              },
              "required": Array [
                "x",
              ],
              "type": "object",
            },
            "type": "object",
          },
        },
        "required": Array [
          "fixed",
          "aBool",
          "aNumber",
          "aRecord",
          "anObject",
          "aString",
        ],
        "type": "object",
      }
    `)
  })

  it('parse args with default values', async () => {
    const Statement = z.object({
      field: z.enum(['title', 'date', 'paymentDate', 'amount']).describe('The name of the field to compare'),
      compare_operator: z.enum(['=', '<', '>', '<=', '>=']).describe('A comparison operator'),
      value: z.union([z.string(), z.number()]).describe('The value to compare against'),
    })

    // Define the schema for friend list
    const Query = z.object({
      connect: z.enum(['AND', 'OR']).describe('The logical operator to connect the statements'),
      statements: z.array(Statement).describe('An array of query statements'),
    })
    expect(schemaExportJsonSchema(Query)).toMatchInlineSnapshot(`
      Object {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "additionalProperties": false,
        "properties": Object {
          "connect": Object {
            "description": "The logical operator to connect the statements",
            "enum": Array [
              "AND",
              "OR",
            ],
            "type": "string",
          },
          "statements": Object {
            "description": "An array of query statements",
            "items": Object {
              "additionalProperties": false,
              "properties": Object {
                "compare_operator": Object {
                  "description": "A comparison operator",
                  "enum": Array [
                    "=",
                    "<",
                    ">",
                    "<=",
                    ">=",
                  ],
                  "type": "string",
                },
                "field": Object {
                  "description": "The name of the field to compare",
                  "enum": Array [
                    "title",
                    "date",
                    "paymentDate",
                    "amount",
                  ],
                  "type": "string",
                },
                "value": Object {
                  "description": "The value to compare against",
                  "type": Array [
                    "string",
                    "number",
                  ],
                },
              },
              "required": Array [
                "field",
                "compare_operator",
                "value",
              ],
              "type": "object",
            },
            "type": "array",
          },
        },
        "required": Array [
          "connect",
          "statements",
        ],
        "type": "object",
      }
    `)
    expect(schemaExportJsonSchema(Query)).toEqual({
      type: 'object',
      properties: {
        connect: {
          type: 'string',
          enum: [
            'AND',
            'OR',
          ],
          description: 'The logical operator to connect the statements',
        },
        statements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: {
                type: 'string',
                enum: [
                  'title',
                  'date',
                  'paymentDate',
                  'amount',
                ],
                description: 'The name of the field to compare',
              },
              compare_operator: {
                type: 'string',
                enum: [
                  '=',
                  '<',
                  '>',
                  '<=',
                  '>=',
                ],
                description: 'A comparison operator',
              },
              value: {
                type: [
                  'string',
                  'number',
                ],
                description: 'The value to compare against',
              },
            },
            required: [
              'field',
              'compare_operator',
              'value',
            ],
            additionalProperties: false,
          },
          description: 'An array of query statements',
        },
      },
      required: [
        'connect',
        'statements',
      ],
      additionalProperties: false,
      $schema: 'http://json-schema.org/draft-07/schema#',
    })
  })
})
