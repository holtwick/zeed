import { decodeJson, encodeJson } from '../bin'
import { useStringHashPool } from '../data/string-hash-pool'
import { cloneObject } from '../data/utils'
import { sleep } from '../exec/promise'
import { createLocalChannelPair } from '../msg/channel-local'
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
    const log: any[] = []
    const [c1, c2] = createLocalChannelPair()

    const serialize = (data: any) => {
      log.push(cloneObject(data))
      return encodeJson(data)
    }
    const deserialize = (data: any) => decodeJson(data)

    const bob = useRPC<BobFunctions, AliceFunctions>(Bob, {
      post: data => c1.postMessage(data),
      on: data => c1.on('message', e => data(e.data)),
      serialize,
      deserialize,
      stringHashPool: useStringHashPool(),
    })

    const alice = useRPC<AliceFunctions, BobFunctions>(Alice, {
      // mark bob's `bump` as an event without response
      eventNames: ['bump'],
      post: data => c2.postMessage(data),

      on: data => c2.on('message', e => data(e.data)),
      serialize,
      deserialize,
      stringHashPool: useStringHashPool(),
    })

    // RPCs
    expect(await bob.hello('Bob')).toEqual('Hello Bob, my name is Alice')
    expect(await alice.hi('Alice')).toEqual('Hi Alice, I am Bob')

    // one-way event
    expect(void alice.bump()).toBeUndefined()

    expect(Bob.getCount()).toBe(0)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(Bob.getCount()).toBe(1)

    c1.close()
    c2.close()

    expect(log).toMatchInlineSnapshot(`
      Array [
        Array [
          1,
          1,
          1335831723,
          "Bob",
        ],
        Array [
          3,
          1,
          "Hello Bob, my name is Alice",
        ],
        Array [
          1,
          2,
          1748694682,
          "Alice",
        ],
        Array [
          3,
          2,
          "Hi Alice, I am Bob",
        ],
        Array [
          2,
          1648103349,
        ],
      ]
    `)
  })

  it('hub', async () => {
    const [c1, c2] = createLocalChannelPair()

    const serialize = (data: any) => encodeJson(data)
    const deserialize = (data: any) => decodeJson(data)

    const bobHub = useRPCHub({
      post: data => c1.postMessage(data),
      on: data => c1.on('message', e => data(e.data)),
      serialize,
      deserialize,
      stringHashPool: useStringHashPool(),
    })

    const bob = bobHub<BobFunctions, AliceFunctions>(Bob)

    const alice = useRPC<AliceFunctions, BobFunctions>(Alice, {
      // mark bob's `bump` as an event without response
      eventNames: ['bump'],
      post: data => c2.postMessage(data),

      on: data => c2.on('message', e => data(e.data)),
      serialize,
      deserialize,
      stringHashPool: useStringHashPool(),
    })

    // RPCs
    expect(await bob.hello('Bob')).toEqual('Hello Bob, my name is Alice')
    expect(await alice.hi('Alice')).toEqual('Hi Alice, I am Bob')

    // one-way event
    expect(void alice.bump()).toBeUndefined()

    expect(Bob.getCount()).toBe(0)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(Bob.getCount()).toBe(1)

    c1.close()
    c2.close()
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
