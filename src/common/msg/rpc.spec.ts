import { MessageChannel } from 'node:worker_threads'
import { decodeJson, encodeJson } from '../bin'
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

describe('rpc', () => {
  beforeEach(() => {
    bobCount = 0
  })

  it('basic', async () => {
    const channel = new MessageChannel()

    // const serialize = (data: any) => JSON.stringify(data)
    // const deserialize = (data: any) => JSON.parse(data)

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
    expect(alice.bump()).toBeUndefined()

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
    expect(alice.bump()).toBeUndefined()

    expect(Bob.getCount()).toBe(0)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(Bob.getCount()).toBe(1)

    channel.port1.close()
    channel.port2.close()
  })
})
