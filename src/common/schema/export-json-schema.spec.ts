import type { Infer } from './schema'
import { schemaExportJsonSchema } from './export-json-schema'
import { z } from './schema'

describe('json-schema.spec', () => {
  it('parse args', async () => {
    const schema = z.object({
      fixed: z.enum(['a', 'b', 'c']).describe('This is a fixed value'),
      anInt: z.int().optional().default(0),
      aBool: z.boolean().describe('This is a boolean'),
      aNumber: z.number().props({
        desc: 'This is a number',
      }),
      aString: z.string(),
    })

    type t = Infer<typeof schema>
    expectTypeOf<t>().toMatchObjectType<{
      fixed: 'a' | 'b' | 'c'
      anInt?: number | undefined
      aBool: boolean
      aNumber: number
      aString: string
    }>()

    const r = schemaExportJsonSchema(schema, 'Test')

    expect(r).toMatchInlineSnapshot(`
      Object {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "properties": Object {
          "aBool": Object {
            "description": "This is a boolean",
            "type": "boolean",
          },
          "aNumber": Object {
            "description": "This is a number",
            "type": "number",
          },
          "aString": Object {
            "type": "string",
          },
          "anInt": Object {
            "default": 0,
            "type": "integer",
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
        },
        "required": Array [
          "fixed",
          "aBool",
          "aNumber",
          "aString",
        ],
        "title": "Test",
        "type": "object",
      }
    `)
  })
})
