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
        "_args": undefined,
        "_check": [Function],
        "_default": undefined,
        "_enumValues": undefined,
        "_info": undefined,
        "_meta": undefined,
        "_object": Object {
          "help": Type {
            "_args": undefined,
            "_check": [Function],
            "_default": false,
            "_enumValues": undefined,
            "_info": undefined,
            "_meta": Object {
              "argDesc": "Shows help",
              "argShort": "h",
            },
            "_object": undefined,
            "_optional": undefined,
            "_ret": undefined,
            "_type": undefined,
            "_union": undefined,
            "type": "boolean",
          },
          "someStuff": Type {
            "_args": undefined,
            "_check": [Function],
            "_default": undefined,
            "_enumValues": undefined,
            "_info": undefined,
            "_meta": Object {
              "argDesc": "Does some stuff",
            },
            "_object": undefined,
            "_optional": true,
            "_ret": undefined,
            "_type": undefined,
            "_union": undefined,
            "type": "number",
          },
        },
        "_optional": undefined,
        "_ret": undefined,
        "_type": undefined,
        "_union": undefined,
        "type": "object",
      }
    `)
  })
})
