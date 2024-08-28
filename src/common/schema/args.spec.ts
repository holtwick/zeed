import { helpSchemaArgs, parseSchemaArgs } from './args'
import type { Infer } from './schema'
import { boolean, number, object } from './schema'

describe('args.spec', () => {
  it('parse args', async () => {
    const schema = object({
      someStuff: number().optional().props({
        argDesc: 'Does some stuff',
      }),
      help: boolean().default(false).props({
        argShort: 'h',
        argDesc: 'Shows help',
      }),
    })

    type t = Infer<typeof schema>
    expectTypeOf<t>().toMatchTypeOf<any>()

    const args = ['test.txt', '-h', '--some-stuff=8888']

    const r = parseSchemaArgs(schema, args)

    expect(r).toMatchInlineSnapshot(`
      Array [
        Object {
          "help": true,
          "someStuff": 8888,
        },
        Array [
          "test.txt",
        ],
      ]
    `)

    expect(helpSchemaArgs(schema)).toMatchInlineSnapshot(`
      "--some-stuff=number
        Does some stuff
      --help, -h
        Shows help"
    `)
  })
})
