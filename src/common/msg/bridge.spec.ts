import { useBridge } from "./bridge"
import { fakeWorkerPair } from "./channel.spec"

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

  it("should do basic bridging", async () => {
    // expect.assertions(1)

    const [clientChannel, serverChannel] = fakeWorkerPair()

    const server = useBridge<BridgeCommands>(
      {
        channel: serverChannel,
      },
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

    const client = useBridge<BridgeCommands>({
      channel: clientChannel,
    })

    expect(client.await).not.toBeNull()

    let x = await client.await.aping(1)
    let y = await client.await.aping(3)

    expect(x).toBe(1)
    expect(y).toBe(3)

    client.ping(2)
  })
})
