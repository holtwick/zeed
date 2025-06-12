import type { Infer } from './schema'
import { schemaExportJsonSchema } from './export-json-schema'
import { z } from './schema'

describe('json-schema.spec', () => {
  it('parse args', async () => {
    const schema = z.object({
      anInt: z.int().optional().default(0),
      aBool: z.boolean().describe('This is a boolean'),
      aNumber: z.number().props({
        desc: 'This is a number',
      }),
      aString: z.string(),
    })

    type t = Infer<typeof schema>
    expectTypeOf<t>().toMatchObjectType<{
      anInt?: number | undefined
      aBool: boolean
      aNumber: number
      aString: string
    }>()

    const r = schemaExportJsonSchema(schema, 'Test')

    expect(r).toMatchInlineSnapshot(`
      "{
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Test",
        "type": "object",
        "properties": {
          "anInt": {
            "type": "int",
            "default": 0
          },
          "aBool": {
            "type": "boolean",
            "description": "This is a boolean"
          },
          "aNumber": {
            "type": "number",
            "description": "This is a number"
          },
          "aString": {
            "type": "string"
          }
        },
        "required": [
          "aBool",
          "aNumber",
          "aString"
        ]
      }"
    `)
  })
})
