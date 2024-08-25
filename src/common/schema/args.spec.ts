import { parseSchemaArgs } from './args'
import { boolean, number, object } from './schema'

describe('args.spec', () => {
  it('parse args', async () => {
    const schema = object({
      someStuff: number().optional(),
      h: boolean().default(false),
    })

    const args = ['test.txt', '-h', '--some-stuff=8888']

    const r = parseSchemaArgs(schema, args)

    expect(r).toMatchInlineSnapshot(`
      Array [
        Object {
          "h": true,
          "someStuff": 8888,
        },
        Array [
          "test.txt",
        ],
      ]
    `)
  })
})
