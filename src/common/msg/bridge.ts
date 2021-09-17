import { promisify, tryTimeout } from "../promise"
import { uname, uuid } from "../uuid"
import { Channel } from "./channel"
import { Logger } from "../log"
import { JsonEncoder } from "./encoder"

interface BridgeOptions {
  timeout?: number
}

/** @deprecated */
export function useBridge<L extends object>(
  info: { channel: Channel; encoder?: any },
  methods?: L
) {
  const { channel, encoder = new JsonEncoder() } = info

  const log = Logger(`bridge:${uname(!!methods ? "server" : "client")}`)

  if (methods) {
    info.channel.on("message", async (msg: any) => {
      const { name, args, id } = encoder.decode(msg.data)
      if (name) {
        log(`name ${name} id ${id}`)
        // @ts-ignore
        let result = await promisify(methods[name](...args))
        log(`result ${result}`)
        if (id) {
          info.channel.postMessage(encoder.encode({ id, result }))
        }
      }
    })
  }

  let waitingForResponse: any = {}

  info.channel.on("message", async (msg: any) => {
    const { name, args, id, result } = encoder.decode(msg.data)
    if (!name && id) {
      log(`id ${id} result ${result}`)
      const resolve = waitingForResponse[id]
      if (resolve) {
        delete waitingForResponse[id]
        resolve(result)
      }
    }
  })

  // The async proxy, waiting for a response
  const createPromiseProxy = (opt: BridgeOptions): L => {
    const { timeout = 5000 } = opt
    return new Proxy<L>({} as any, {
      get: (target: any, name: any) => {
        return (...args: any): any => {
          if (!methods) {
            const id = uuid()
            info.channel.postMessage(encoder.encode({ name, args, id }))
            return tryTimeout(
              new Promise((resolve) => (waitingForResponse[id] = resolve)),
              timeout
            )
          }
        }
      },
    })
  }

  // The regular proxy without responding, just send
  return new Proxy<
    L & {
      promise: L
      options(opt: BridgeOptions): L
    }
  >(
    {
      promise: createPromiseProxy({}),
      options: (opt: BridgeOptions): L => createPromiseProxy(opt),
    } as any,
    {
      get: (target: any, name: any) => {
        if (name in target) return target[name]
        return (...args: any): any => {
          if (!methods) {
            info.channel.postMessage(encoder.encode({ name, args }))
          }
        }
      },
    }
  )
}
