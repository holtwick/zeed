import { fakeWorkerPair } from "./channel"
import { useMessageHub, useMessages } from "./messages"

interface TestMessages {
  ping(value: number): number
  aping(value: number | string): Promise<number | string>
}

describe("messages", () => {
  it("should show the magic of proxies ", () => {
    let p = new Proxy<TestMessages>({} as any, {
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

    useMessages<TestMessages>({
      channel: serverChannel,
      handlers: {
        ping(value) {
          expect(value).toBe(2)
          return value
        },
        async aping(value) {
          return new Promise((resolve) => setTimeout(() => resolve(value), 500))
        },
      },
    })

    const client = useMessages<TestMessages>({
      channel: clientChannel,
    })

    let x = await client.aping(1)
    let y = await client.aping("Hällo W👨‍👩‍👧‍👦rld")

    expect(x).toBe(1)
    expect(y).toBe("Hällo W👨‍👩‍👧‍👦rld")

    client.ping(2)
  })

  it("should connect later", async () => {
    // expect.assertions(1)

    const [clientChannel, serverChannel] = fakeWorkerPair()

    const server = useMessages<TestMessages>({
      handlers: {
        ping(value) {
          expect(value).toBe(2)
          return value
        },
        async aping(value) {
          return new Promise((resolve) => setTimeout(() => resolve(value), 500))
        },
      },
    })

    const client = useMessages<TestMessages>()

    // @ts-ignore
    server.connect(serverChannel)
    // @ts-ignore
    client.connect(clientChannel)

    let x = await client.aping(1)
    let y = await client
      .options({
        timeout: 1000,
      })
      .aping("Hällo W👨‍👩‍👧‍👦rld")

    expect(x).toBe(1)
    expect(y).toBe("Hällo W👨‍👩‍👧‍👦rld")

    client.ping(2)
  })

  it("should do hub thing", async () => {
    // expect.assertions(1)

    const [clientChannel, serverChannel] = fakeWorkerPair()

    const serverHub = useMessageHub({ channel: serverChannel })
    serverHub.server<Partial<TestMessages>>({
      ping(value) {
        expect(value).toBe(2)
        return value
      },
    })
    serverHub.server<Partial<TestMessages>>({
      async aping(value) {
        return new Promise((resolve) => setTimeout(() => resolve(value), 500))
      },
    })

    const clientHub = useMessageHub({ channel: clientChannel })
    const client = clientHub.client<TestMessages>()

    let x = await client.aping(1)
    let y = await client.aping("Hällo W👨‍👩‍👧‍👦rld")

    expect(x).toBe(1)
    expect(y).toBe("Hällo W👨‍👩‍👧‍👦rld")

    client.ping(2)
  })
})
