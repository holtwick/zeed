import type { Infer } from './schema'
import { helpSchemaArgs, parseSchemaArgs } from './parse-args'
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
    expectTypeOf<t>().toMatchObjectType<{
      someStuff?: number | undefined
      help: boolean
    }>()

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

    //

    const rr = parseSchemaArgs(schema, [])
    expect(rr).toMatchInlineSnapshot(`
      Array [
        Object {
          "help": false,
          "someStuff": undefined,
        },
        Array [],
      ]
    `)

    expect(schema).toMatchInlineSnapshot(`
      TypeObjectClass {
        "_check": [Function],
        "_object": Object {
          "help": TypeGeneric {
            "_check": [Function],
            "_default": false,
            "_props": Object {
              "argDesc": "Shows help",
              "argShort": "h",
            },
            "type": "boolean",
          },
          "someStuff": TypeGeneric {
            "_check": [Function],
            "_optional": true,
            "_props": Object {
              "argDesc": "Does some stuff",
            },
            "type": "number",
          },
        },
        "type": "object",
      }
    `)
  })
})
