export {}

// These can be emitted from both the Client or the Server
interface BridgeBothWays {}

// These are emitted by the client to the service
interface BridgeToServer extends BridgeBothWays {}

// These are emitted by the service to the client
interface BridgeToClient extends BridgeBothWays {}

interface BridgeCommands {
  ping(value: number): number
  pong(value: number): number
}

class Client<BridgeCommands> {}

const serveBridge: BridgeCommands = {
  ping(value: number): number {
    throw new Error("Method not implemented.")
  },
  pong(value: number): number {
    throw new Error("Method not implemented.")
  },
}

class Server implements BridgeCommands {
  ping(value: number): number {
    throw new Error("Method not implemented.")
  }
  pong(value: number): number {
    throw new Error("Method not implemented.")
  }
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
    expect(p.ping(p.pong(2))).toBe(2)
  })
})
