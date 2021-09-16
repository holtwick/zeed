import { promisify, tryTimeout } from "../promise"
import { uname, uuid } from "../uuid"
import { Channel } from "./channel"
import { Logger } from ".."

export function useBridge<L extends object>(
  info: { channel: Channel },
  methods?: L
): L & { promise: L } {
  const log = Logger(`bridge:${uname(!!methods ? "server" : "client")}`)

  if (methods) {
    info.channel.on("message", async (msg: any) => {
      const { name, args, id } = msg.data
      if (name) {
        log(`name ${name} id ${id}`)
        // @ts-ignore
        let result = await promisify(methods[name](...args))
        log(`result ${result}`)
        if (id) {
          info.channel.postMessage({ id, result })
        }
      }
    })
  }

  let waitingForResponse: any = {}

  info.channel.on("message", async (msg: any) => {
    const { name, args, id, result } = msg.data
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
  let aproxy: L = new Proxy<L>({} as any, {
    get: (target: any, name: any) => {
      return (...args: any): any => {
        if (!methods) {
          const id = uuid()
          info.channel.postMessage({ name, args, id })
          return tryTimeout(
            new Promise((resolve) => (waitingForResponse[id] = resolve)),
            1000
          )
        }
      }
    },
  })

  // The regular proxy without responding, just send
  return new Proxy<L & { promise: L }>(
    {
      promise: aproxy,
    } as any,
    {
      get: (target: any, name: any) => {
        if (name in target) return target[name]
        return (...args: any): any => {
          if (!methods) {
            info.channel.postMessage({ name, args })
          }
        }
      },
    }
  )
}
