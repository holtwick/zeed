import { func, object, string } from './schema'
import type { Infer, Type } from './schema'

// see https://github.com/colinhacks/zod?tab=readme-ov-file#functions

describe('rpc.spec', () => {
  it('should do something', async () => {
    const rpcSchema = object({
      echo: func([string()], string()),
    })

    type RpcRaw = Infer<typeof rpcSchema>
  })
})
