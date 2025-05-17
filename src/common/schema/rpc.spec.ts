import type { Infer } from './schema'
import { expectTypeOf } from 'vitest'
import { boolean, func, number, object, rpc, string } from './schema'

// see https://github.com/colinhacks/zod?tab=readme-ov-file#functions

declare module './schema' {
  interface TypeProps {
    rpcDesc?: string
  }
}

describe('rpc.spec', () => {
  it('should do something', async () => {
    const rpcFn = object({ rpc: rpc() })
    type RpcFn = Infer<typeof rpcFn>
    expectTypeOf<RpcFn>().toMatchObjectType<{
      rpc: () => void
    }>()

    const rpcFn2 = object({ rpc: rpc(object({
      a: number(),
    }), string()) })
    type RpcFn2 = Infer<typeof rpcFn2>
    expectTypeOf<RpcFn2>().toMatchObjectType<{
      rpc: (info: { a: number }) => string | Promise<string>
    }>()

    const payloadSchema = object({
      id: string(),
      method: string(),
      params: object({
        a: string(),
        b: boolean(),
      }),
    })

    type PayloadSchema = Infer<typeof payloadSchema>

    expectTypeOf<PayloadSchema>().toMatchObjectType<{
      id: string
      method: string
      params: {
        a: string
        b: boolean
      }
    }>()

    const rpcSchema = object({
      echo: func(
        [string(), boolean()],
        string().optional(),
      ).props({
        rpcDesc: 'Just echo the string',
      }),
      rpc: rpc(payloadSchema),
      noFunc: string(),
    })

    type RpcRaw = Infer<typeof rpcSchema>

    expectTypeOf<RpcRaw>().toMatchObjectType<{
      echo: (args_0: string, args_1: boolean) => string | undefined
      rpc: (info: {
        id: string
        method: string
        params: {
          a: string
          b: boolean
        }
      }) => void | Promise<void>
      noFunc: string
    }>()

    const api: RpcRaw = {
      echo: (a: string, b: boolean) => {
        return a + b
      },
      noFunc: 'noFunc',
      rpc(info) {
        const _ = info.id
        // return undefined
      },
    }

    expect(rpcSchema).toMatchInlineSnapshot(`
      TypeObjectClass {
        "_check": [Function],
        "_object": Object {
          "echo": TypeFuncClass {
            "_args": Array [
              TypeStringClass {
                "_check": [Function],
                "extend": [Function],
                "type": "string",
              },
              TypeGeneric {
                "_check": [Function],
                "extend": [Function],
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
              "extend": [Function],
              "type": "string",
            },
            "extend": [Function],
            "type": "function",
          },
          "noFunc": TypeStringClass {
            "_check": [Function],
            "extend": [Function],
            "type": "string",
          },
          "rpc": TypeRpcClass {
            "_check": [Function],
            "_info": TypeObjectClass {
              "_check": [Function],
              "_object": Object {
                "id": TypeStringClass {
                  "_check": [Function],
                  "extend": [Function],
                  "type": "string",
                },
                "method": TypeStringClass {
                  "_check": [Function],
                  "extend": [Function],
                  "type": "string",
                },
                "params": TypeObjectClass {
                  "_check": [Function],
                  "_object": Object {
                    "a": TypeStringClass {
                      "_check": [Function],
                      "extend": [Function],
                      "type": "string",
                    },
                    "b": TypeGeneric {
                      "_check": [Function],
                      "extend": [Function],
                      "type": "boolean",
                    },
                  },
                  "extend": [Function],
                  "type": "object",
                },
              },
              "extend": [Function],
              "type": "object",
            },
            "_ret": TypeGeneric {
              "_check": [Function],
              "_optional": true,
              "extend": [Function],
              "type": "none",
            },
            "extend": [Function],
            "type": "rpc",
          },
        },
        "extend": [Function],
        "type": "object",
      }
    `)
  })

  // it('should use a schema for useRPC', async () => {
  //   const rpcSchema = object({
  //     echo: func(
  //       [string(), boolean()],
  //       string().optional(),
  //     ).props({
  //       rpcDesc: 'Just echo the string',
  //     }),
  //     noFunc: string(),
  //   })

  //   type RpcRaw = Infer<typeof rpcSchema>

  //   expectTypeOf<RpcRaw>().toMatchObjectType<{
  //     echo: (args_0: string, args_1: boolean) => string | undefined
  //     noFunc: string
  //   }>()

  //   const bob = useRPC<RpcRaw>({
  //     echo: (a: string, b: boolean) => {
  //       return a + b
  //     },
  //     noFunc: 'noFunc',
  //   }, {
  //     post: () => { },
  //     on: () => { },
  //   })

  //   const r = await bob.echo('hello', true)
  //   expect(r).toEqual('hellotrue')
  // })
})
