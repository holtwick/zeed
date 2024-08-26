import { string } from './schema'
import type { Infer, Type } from './types'

// see https://github.com/colinhacks/zod?tab=readme-ov-file#functions

describe('rpc.spec', () => {
  it('should do something', async () => {
    const rpcSchema = {
      echo: string(),
    }

    type RpcRaw = typeof rpcSchema

    type RpcFunc<T> = {
      [K in keyof T]: (arg: Infer<T[K]>) => void
    }

    type Rpc = RpcFunc<RpcRaw>
  })

  it('should do something2', async () => {
    function func(args: Type<any>[], result?: Type<any>) {
      return {
        args,
        result,
      }
    }

    const rpcSchema = {
      echo: func([string()], string()),
    }

    type RpcRaw = typeof rpcSchema

    type RpcFunc<T> = {
      [K in keyof T]: (arg: Infer<T[K]>) => void
    }

    type Rpc = RpcFunc<RpcRaw>
  })
})
