import { fakeWorkerPair } from "./channel"
import { useMessages } from "./messages"

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

    useMessages<TestMessages>(
      {
        channel: serverChannel,
      },
      {
        ping(value) {
          expect(value).toBe(2)
          return value
        },
        async aping(value) {
          return new Promise((resolve) => setTimeout(() => resolve(value), 500))
        },
      }
    )

    const client = useMessages<TestMessages>({
      channel: clientChannel,
    })

    let x = await client.aping(1)
    let y = await client.aping("Hällo W👨‍👩‍👧‍👦rld")

    expect(x).toBe(1)
    expect(y).toBe("Hällo W👨‍👩‍👧‍👦rld")

    client.ping(2)
  })
})
