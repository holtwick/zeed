import type { Infer } from './schema'
import { helpSchemaArgs, parseSchemaArgs } from './parse-args'
import { boolean, number, object } from './schema'

describe('args.spec', () => {
  it('parse args', async () => {
    const schema = object({
      someStuff: number().optional().meta({
        argDesc: 'Does some stuff',
      }),
      help: boolean().default(false).meta({
        argShort: 'h',
        argDesc: 'Shows help',
      }),
    })

    type t = Infer<typeof schema>
    expectTypeOf<t>().toMatchObjectType<{
      someStuff?: number
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
      Type {
        "_check": [Function],
        "_object": Object {
          "help": Type {
            "_check": [Function],
            "_default": false,
            "_meta": Object {
              "argDesc": "Shows help",
              "argShort": "h",
            },
            "extend": [Function],
            "type": "boolean",
          },
          "someStuff": Type {
            "_check": [Function],
            "_meta": Object {
              "argDesc": "Does some stuff",
            },
            "_optional": true,
            "extend": [Function],
            "type": "number",
          },
        },
        "extend": [Function],
        "type": "object",
      }
    `)
  })
})
