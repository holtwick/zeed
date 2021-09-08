export {}

// These can be emitted from both the Client or the Server
interface BridgeBothWays {}

// These are emitted by the client to the service
interface BridgeToServer extends BridgeBothWays {}

// These are emitted by the service to the client
interface BridgeToClient extends BridgeBothWays {}

describe("bridge", () => {
  it("should ", () => {})
})
