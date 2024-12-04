import type { Infer } from './schema'
import { schemaExportSwiftStruct } from './export-swift'
import { boolean, int, number, object, string } from './schema'

describe('swift.spec', () => {
  it('parse args', async () => {
    const schema = object({
      anInt: int().optional().default(0),
      aBool: boolean(),
      aNumber: number(),
      aString: string(),
    })

    type t = Infer<typeof schema>
    expectTypeOf<t>().toMatchTypeOf<any>()

    const r = schemaExportSwiftStruct(schema, 'Test')

    expect(r).toMatchInlineSnapshot(`
      "struct Test {
        var anInt: Int? = 0
        var aBool: Bool
        var aNumber: Double
        var aString: String
      }"
    `)
  })
})
