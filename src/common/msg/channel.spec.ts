// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { vi } from 'vitest'
import { Logger } from '../log'
import { createLocalChannelPair } from './channel'

const log = Logger('test:channel')

describe('Channel', () => {
  it('should fake', (done) => {
    // log.info("done", done.toSource())
    expect.assertions(1)

    const [f1, f2] = createLocalChannelPair()

    f1.on('message', (ev) => {
      expect(ev.data).toBe('123')
      done()
    })

    f2.postMessage('123')
  })

  it('should fake2', (done) => {
    // log.info("done", done.toSource())
    expect.assertions(1)

    const fn = vi.fn()

    const [f1, f2] = createLocalChannelPair()

    f1.on('message', fn)
    f2.on('message', fn)

    f2.postMessage('123')
    f1.postMessage('abc')

    expect(fn.mock.calls.map((c: any) => c[0].data)).toMatchInlineSnapshot(`
      Array [
        "123",
        "abc",
      ]
    `)
  })
})
