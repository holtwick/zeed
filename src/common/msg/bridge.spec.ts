export {}

// These can be emitted from both the Client or the Server
interface BridgeBoth {}

// These are emitted by the client to the service
interface BridgeClientToServer extends BridgeBoth {}

// These are emitted by the service to the client
interface BridgeServiceToClient extends BridgeBoth {}

describe("bridge", () => {
  it("should ", () => {})
})
