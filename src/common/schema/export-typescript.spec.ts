import type { Infer } from './schema'
import { schemaExportTypescriptInterface } from './export-typescript'
import { z } from './schema'

describe('typescript.spec', () => {
  it('parse args', async () => {
    const schema = z.object({
      anInt: z.int().optional().default(0),
      aBool: z.boolean(),
      aNumber: z.number(),
      aString: z.string(),
    })

    type t = Infer<typeof schema>
    expectTypeOf<t>().toMatchObjectType<{
      anInt?: number | undefined
      aBool: boolean
      aNumber: number
      aString: string
    }>()

    const r = schemaExportTypescriptInterface(schema, 'Test')

    expect(r).toMatchInlineSnapshot(`
      "interface Test {
        anInt?: number
        aBool: boolean
        aNumber: number
        aString: string
      }"
    `)
  })
})
