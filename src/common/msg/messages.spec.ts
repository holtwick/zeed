import { deriveKeyPbkdf2, randomUint8Array } from '../crypto'
import { createLocalChannelPair } from './channel'
import { CryptoEncoder } from './encoder'
import type { MessageDefinitions } from './messages'
import { useMessageHub } from './messages'

interface TestMessages1 extends MessageDefinitions {
  ping: (value: number) => Promise<number>
}

interface TestMessages2 extends MessageDefinitions {
  aping: (value: number | string) => Promise<number | string>
}

// interface TestMessages2 {
//   aping(value: number | string): Promise<number | string>
// }

type TestMessages = TestMessages1 & TestMessages2

describe('messages', () => {
  it('should show the magic of proxies ', async () => {
    const p = new Proxy<TestMessages1>({} as any, {
      get(_target, _name) {
        // console.log(target, name)
        return (...args: any) => {
          // console.log(name, args)
          return args[0] ?? 0
        }
      },
    })
    expect(await p.ping(await p.ping(2))).toBe(2)
  })

  it('should do hub thing', async () => {
    // expect.assertions(1)

    // Some secret encoder
    const key = await deriveKeyPbkdf2(randomUint8Array(20))
    const encoder = new CryptoEncoder(key)

    // const encoder = new JsonEncoder()

    const [clientChannel, serverChannel] = createLocalChannelPair()

    const serverHub = useMessageHub({ channel: serverChannel, encoder })
    serverHub.listen<TestMessages1>({
      async ping(value) {
        expect(value).toBe(2)
        return value
      },
    })
    serverHub.listen<TestMessages2>({
      async aping(value) {
        return new Promise(resolve => setTimeout(() => resolve(value), 500))
      },
    })

    const clientHub = useMessageHub({ channel: clientChannel, encoder })
    const client = clientHub.send<TestMessages>()

    const x = await client.aping(1)
    const y = await client.aping('Hällo W👨‍👩‍👧‍👦rld')

    expect(x).toBe(1)
    expect(y).toBe('Hällo W👨‍👩‍👧‍👦rld')

    await client.ping(2)
  })

  // it("should do basic bridging", async () => {
  //   // expect.assertions(1)

  //   const [clientChannel, serverChannel] = createLocalChannelPair()

  //   useMessages<TestMessages>({
  //     channel: serverChannel,
  //     handlers: {
  //       ping(value) {
  //         expect(value).toBe(2)
  //         return value
  //       },
  //       async aping(value) {
  //         return new Promise((resolve) => setTimeout(() => resolve(value), 500))
  //       },
  //     },
  //   })

  //   const client = useMessages<TestMessages>({
  //     channel: clientChannel,
  //   })

  //   let x = await client.aping(1)
  //   let y = await client.aping("Hällo W👨‍👩‍👧‍👦rld")

  //   expect(x).toBe(1)
  //   expect(y).toBe("Hällo W👨‍👩‍👧‍👦rld")

  //   client.ping(2)
  // })

  // it("should connect later", async () => {
  //   // expect.assertions(1)

  //   const [clientChannel, serverChannel] = createLocalChannelPair()

  //   const server = useMessages<TestMessages>({
  //     handlers: {
  //       ping(value) {
  //         expect(value).toBe(2)
  //         return value
  //       },
  //       async aping(value) {
  //         return new Promise((resolve) => setTimeout(() => resolve(value), 500))
  //       },
  //     },
  //   })

  //   const client = useMessages<TestMessages>()

  //   // @ts-ignore
  //   server.connect(serverChannel)
  //   // @ts-ignore
  //   client.connect(clientChannel)

  //   let x = await client.aping(1)
  //   let y = await client
  //     .options({
  //       timeout: 1000,
  //     })
  //     .aping("Hällo W👨‍👩‍👧‍👦rld")

  //   expect(x).toBe(1)
  //   expect(y).toBe("Hällo W👨‍👩‍👧‍👦rld")

  //   client.ping(2)
  // })
})
