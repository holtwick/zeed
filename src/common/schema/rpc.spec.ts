import type { Infer } from './schema'
import { useRPC } from '../msg/rpc'
import { boolean, func, object, string } from './schema'

// see https://github.com/colinhacks/zod?tab=readme-ov-file#functions

declare module './schema' {
  interface TypeProps {
    rpcDesc?: string
  }
}

describe('rpc.spec', () => {
  it('should do something', async () => {
    const rpcSchema = object({
      echo: func(
        [string(), boolean()],
        string().optional(),
      ).props({
        rpcDesc: 'Just echo the string',
      }),
      noFunc: string(),
    })

    type RpcRaw = Infer<typeof rpcSchema>

    expectTypeOf<RpcRaw>().toMatchObjectType<{
      echo: (args_0: string, args_1: boolean) => string | undefined
      noFunc: string
    }>()

    expect(rpcSchema).toMatchInlineSnapshot(`
      TypeObjectClass {
        "_check": [Function],
        "_object": Object {
          "echo": TypeFuncClass {
            "_args": Array [
              TypeStringClass {
                "_check": [Function],
                "type": "string",
              },
              TypeGeneric {
                "_check": [Function],
                "type": "boolean",
              },
            ],
            "_check": [Function],
            "_props": Object {
              "rpcDesc": "Just echo the string",
            },
            "_ret": TypeStringClass {
              "_check": [Function],
              "_optional": true,
              "type": "string",
            },
            "type": "function",
          },
          "noFunc": TypeStringClass {
            "_check": [Function],
            "type": "string",
          },
        },
        "type": "object",
      }
    `)
  })

  it('should use a schema for useRPC', async () => {
    const rpcSchema = object({
      echo: func(
        [string(), boolean()],
        string().optional(),
      ).props({
        rpcDesc: 'Just echo the string',
      }),
      noFunc: string(),
    })

    type RpcRaw = Infer<typeof rpcSchema>

    expectTypeOf<RpcRaw>().toMatchObjectType<{
      echo: (args_0: string, args_1: boolean) => string | undefined
      noFunc: string
    }>()

    const bob = useRPC<RpcRaw>({
      echo: (a: string, b: boolean) => {
        return a + b
      },
      noFunc: 'noFunc',
    }, {
      post: () => { },
      on: () => { },
    })

    const r = await bob.echo('hello', true)
    expect(r).toEqual('hellotrue')
  })
})
