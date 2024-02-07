// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { createLocalChannelPair } from './channel'
import { usePubSub } from './pubsub'

// const log = Logger('test:connection')

interface SampleProtocol {
  bla: (a: string, b: number) => void
}

describe('connection', () => {
  it('should send and receive messages', async () => {
    expect.assertions(3)

    const [f1, f2] = createLocalChannelPair()

    const c1 = usePubSub<SampleProtocol>({ channel: f1 })
    const c2 = usePubSub<SampleProtocol>({ channel: f2 })

    let counter = 0

    c1.on('bla', (a, b) => {
      counter -= b
    })
    c2.on('bla', (a, b) => {
      counter += b
      expect(a).toBe('hello')
    })

    await c1.emit('bla', 'hello', 3)

    expect(counter).toBe(3)

    await c2.emit('bla', 'hello2', 2)

    expect(counter).toBe(1)
  })

  it('should send and receive messages - alternative syntax', async () => {
    expect.assertions(3)

    const [f1, f2] = createLocalChannelPair()

    const c1 = usePubSub<SampleProtocol>({ channel: f1 })
    const c2 = usePubSub<SampleProtocol>({ channel: f2 })

    let counter = 0

    c1.subscribe('bla', (a, b) => {
      counter -= b
    })
    c2.subscribe('bla', (a, b) => {
      counter += b
      expect(a).toBe('hello')
    })

    await c1.publish('bla', 'hello', 3)

    expect(counter).toBe(3)

    await c2.publish('bla', 'hello2', 2)

    expect(counter).toBe(1)
  })
})
