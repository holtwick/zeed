import type { Infer } from './schema'
import { schemaExportSwiftStruct } from './export-swift'
import { z } from './z'

describe('swift.spec', () => {
  it('parse args', async () => {
    const schema = z.object({
      anInt: z.int().optional().default(0),
      aBool: z.boolean(),
      aNumber: z.number(),
      aString: z.string().meta({ swiftDefault: 'String(EXAMPLE)' }),
    }).meta({
      swiftName: 'Test123',
      swiftProtocol: 'Codable',
    })

    type t = Infer<typeof schema>
    expectTypeOf<t>().toMatchObjectType<{
      anInt?: number | undefined
      aBool: boolean
      aNumber: number
      aString: string
    }>()

    const r = schemaExportSwiftStruct(schema)

    expect(r).toMatchInlineSnapshot(`
      "struct Test123: Codable {
        var anInt: Int? = 0
        var aBool: Bool
        var aNumber: Double
        var aString: String = String(EXAMPLE)
      }"
    `)
  })
})
