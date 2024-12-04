import type { Infer } from './schema'
import { schemaExportTypescriptInterface } from './export-typescript'
import { boolean, int, number, object, string } from './schema'

describe('typescript.spec', () => {
  it('parse args', async () => {
    const schema = object({
      anInt: int().optional().default(0),
      aBool: boolean(),
      aNumber: number(),
      aString: string(),
    })

    type t = Infer<typeof schema>
    expectTypeOf<t>().toMatchTypeOf<any>()

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
