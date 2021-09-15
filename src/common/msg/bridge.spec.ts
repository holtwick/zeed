import { promisify, tryTimeout } from "../promise"
import { uname, uuid } from "../uuid"
import { Channel } from "./channel"
import { fakeWorkerPair } from "./channel.spec"
import { Logger } from ".."

export {}

// These can be emitted from both the Client or the Server
interface BridgeBothWays {}

// These are emitted by the client to the service
interface BridgeToServer extends BridgeBothWays {}

// These are emitted by the service to the client
interface BridgeToClient extends BridgeBothWays {}

interface BridgeCommands {
  ping(value: number): number
  aping(value: number): Promise<number>
}

describe("bridge", () => {
  it("should show the magic of proxies ", () => {
    let p = new Proxy<BridgeCommands>({} as any, {
      get(target, name) {
        console.log(target, name)
        return (...args: any) => {
          console.log(name, args)
          return args[0] ?? 0
        }
      },
    })
    expect(p.ping(p.ping(2))).toBe(2)
  })

  function useBridge<L extends object>(
    info: { channel: Channel },
    methods?: L
  ): L & { await: L } {
    const log = Logger(`bridge:${!!methods ? "server" : "client"}:${uname()}`)

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
    let proxy: L & { await: L } = new Proxy<L & { await: L }>({} as any, {
      get: (target: any, name: any) => {
        if (name === "await") {
          return aproxy
        }
        return (...args: any): any => {
          if (!methods) {
            info.channel.postMessage({ name, args })
          }
        }
      },
    })

    return proxy
  }

  it("should do basic bridging", async () => {
    // expect.assertions(1)

    const [clientChannel, serverChannel] = fakeWorkerPair()

    const server = useBridge<BridgeCommands>(
      { channel: serverChannel },
      {
        ping(value: number): number {
          expect(value).toBe(2)
          return value
        },
        async aping(value: number): Promise<number> {
          return value ///new Promise((resolve) => setTimeout(() => resolve(value), 500))
        },
      }
    )

    const client = useBridge<BridgeCommands>({ channel: clientChannel })

    expect(client.await).not.toBeNull()

    let x = await client.await.aping(1)
    expect(x).toBe(1)

    client.ping(2)
  })
})

// Client Side

// Server Side
