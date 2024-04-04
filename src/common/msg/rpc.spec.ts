import { MessageChannel } from 'node:worker_threads'
import { decodeJson, encodeJson } from '../bin'
import { createLocalChannelPair } from '../msg/channel-local'
import { sleep } from '../exec/promise'
import { useRPC, useRPCHub } from './rpc'

let bobCount = 0

const Bob = {
  hi(name: string) {
    return `Hi ${name}, I am Bob`
  },
  bump() {
    bobCount += 1
  },
  getCount() {
    return bobCount
  },
}

const Alice = {
  hello(name: string) {
    return `Hello ${name}, my name is Alice`
  },
}

type BobFunctions = typeof Bob
type AliceFunctions = typeof Alice

describe('rpc async', () => {
  beforeEach(() => {
    bobCount = 0
  })

  it('basic', async () => {
    const channel = new MessageChannel()

    const serialize = (data: any) => encodeJson(data)
    const deserialize = (data: any) => decodeJson(data)

    const bob = useRPC<BobFunctions, AliceFunctions>(Bob, {
      post: data => channel.port1.postMessage(data),
      on: data => channel.port1.on('message', data),
      serialize,
      deserialize,
    })

    const alice = useRPC<AliceFunctions, BobFunctions>(Alice, {
      // mark bob's `bump` as an event without response
      eventNames: ['bump'],
      post: data => channel.port2.postMessage(data),

      on: data => channel.port2.on('message', data),
      serialize,
      deserialize,
    })

    // RPCs
    expect(await bob.hello('Bob')).toEqual('Hello Bob, my name is Alice')
    expect(await alice.hi('Alice')).toEqual('Hi Alice, I am Bob')

    // one-way event
    expect(void alice.bump()).toBeUndefined()

    expect(Bob.getCount()).toBe(0)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(Bob.getCount()).toBe(1)

    channel.port1.close()
    channel.port2.close()
  })

  it('hub', async () => {
    const channel = new MessageChannel()
    const serialize = (data: any) => encodeJson(data)
    const deserialize = (data: any) => decodeJson(data)

    const bobHub = useRPCHub({
      post: data => channel.port1.postMessage(data),
      on: data => channel.port1.on('message', data),
      serialize,
      deserialize,
    })

    const bob = bobHub<BobFunctions, AliceFunctions>(Bob)

    const alice = useRPC<AliceFunctions, BobFunctions>(Alice, {
      // mark bob's `bump` as an event without response
      eventNames: ['bump'],
      post: data => channel.port2.postMessage(data),

      on: data => channel.port2.on('message', data),
      serialize,
      deserialize,
    })

    // RPCs
    expect(await bob.hello('Bob')).toEqual('Hello Bob, my name is Alice')
    expect(await alice.hi('Alice')).toEqual('Hi Alice, I am Bob')

    // one-way event
    expect(void alice.bump()).toBeUndefined()

    expect(Bob.getCount()).toBe(0)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(Bob.getCount()).toBe(1)

    channel.port1.close()
    channel.port2.close()
  })

  it('timeout async', async (done) => {
    const [f1, f2] = createLocalChannelPair()

    const rpc1 = useRPC({
      async echo(v: string, s = 5) {
        // console.log('echo 1', v)
        await sleep(s)
        return `${v}_1`
      },
    }, {
      post: (data) => {
        // console.log(1, 'post', data)
        f1.postMessage(data)
      },
      on: data => f1.on('message', (msg) => {
        // console.log(1, msg)
        void data(msg.data)
      }),
      timeout: 10,
    })

    const rpc2 = useRPC({
      async echo(v: string, s = 5) {
        // console.log('echo 2', v)
        await sleep(s)
        return `${v}_2`
      },
    }, {
      post: (data) => {
        // console.log(2, 'post', data)
        f2.postMessage(data)
      },
      on: data => f2.on('message', (msg) => {
        // console.log(2, msg)
        void data(msg.data)
      }),
      timeout: 10,
    })

    const r = await rpc1.echo('abc')
    expect(r).toMatchInlineSnapshot(`"abc_2"`)

    try {
      const r2 = await rpc1.echo('abc', 50)
      expect(false).toBe(true)
    }
    catch (err) {
      expect(err).toMatchInlineSnapshot(`[Error: rpc timeout on calling "echo"]`)
    }
  })

  it('async', async (done) => {
    function echo(n: number): any {
      return n
    }

    async function echoAsync(n: number) {
      return n
    }

    expect(await echo(1)).toBe(1)
    expect(await echoAsync(2)).toBe(2)
  })
})
