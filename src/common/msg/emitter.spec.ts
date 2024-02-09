import { vi } from 'vitest'
import { detect } from '../platform'
import { sleep, waitOn } from '../exec/promise'
import { getSecureRandomIfPossible } from '../data/math'
import { Emitter, getGlobalEmitter } from './emitter'

const platform = detect()

declare global {
  interface ZeedGlobalEmitter {
    a: (n: number) => void
    b: (n: number) => void
  }
}

// For debugging

interface LazyEvent {
  key: string
  obj: any
}

export function lazyListener(
  emitter: any,
  listenerKey?: string,
): (key?: string, skipUnmatched?: boolean) => Promise<any> {
  const name = Math.round(getSecureRandomIfPossible() * 100)

  const events: LazyEvent[] = []
  let lazyResolve: (() => void) | undefined

  const incoming = (key: string, obj: any) => {
    const ev = { key, obj }
    // debug(name, "  lazy push", ev)
    events.push(ev)
    lazyResolve && lazyResolve()
  }

  if (listenerKey) {
    if (emitter.on) {
      emitter.on(listenerKey, (obj: any) => {
        incoming(listenerKey, obj)
      })
    }
    else if (emitter.addEventListener) {
      emitter.addEventListener(listenerKey, (obj: any) => {
        incoming(listenerKey, obj)
      })
    }
    else {
      emitter.log.error(name, 'Cannot listen to key')
    }
  }
  else {
    if (emitter.onAny) {
      emitter.onAny((key: string, obj: any) => {
        incoming(key, obj)
      })
    }
    else {
      emitter.log.error(name, 'cannot listen to all for', emitter)
    }
  }

  const on = (key?: string, skipUnmatched = true): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!key) {
        key = listenerKey
        if (!key) {
          if (events.length) {
            // no key specified? just take the first one!
            key = events[0].key
          }
        }
      }
      // debug(name, "lazy resolve on2", key, skipUnmatched, events)
      lazyResolve = () => {
        // debug(name, "lazy resolve", key, listenerKey, events)
        while (events.length > 0) {
          const ev = events.shift() as LazyEvent
          // debug(name, "  lazy analyze", ev)
          if (ev.key === key) {
            lazyResolve = undefined
            resolve(ev.obj)
          }
          else {
            if (skipUnmatched) {
              // log.warn(name, `Unhandled event ${key} with value: ${ev.obj}`)
              continue
            }
            reject(new Error(`Expected ${key}, but found ${ev.key} with value=${ev.obj}`))
            // log.error(name, `Unhandled event ${key} with value: ${ev.obj}`)
          }
          break
        }
      }
      lazyResolve()
    })
  }

  return on
}

describe('emitter', () => {
  it('should emit', async () => {
    expect.assertions(4)

    interface TestMessages {
      test: (x: number, y: number) => void
      long: () => Promise<void>
    }

    let ctr = 0

    const e = new Emitter<TestMessages>()
    e.on('test', (x, y) => expect(x + y).toBe(123))
    e.on('long', async () => {
      await sleep(500)
      ctr++
    })

    const ee = e.call

    await ee.long()
    expect(ctr).toBe(1)

    e.onCall({
      test(x: number, y: number) {
        expect(x + y).toBe(123)
      },
    })

    await e.emit('long')
    expect(ctr).toBe(2)

    await e.emit('test', 100, 23)
  })

  it('should work', async () => {
    interface TestMessages {
      a: () => void
      b: () => void
    }

    const e1 = new Emitter<TestMessages>()
    const e2 = new Emitter<TestMessages>()

    let counter = 99

    e1.on('a', () => counter++)

    e2.on('a', () => counter--)
    e2.on('b', () => counter--)

    void e1.emit('a')

    expect(counter).toBe(100)

    void e2.emit('a')
    void e2.emit('b')

    expect(counter).toBe(98)

    e1.on('a', () => counter++)
    void e1.emit('a') // twice!
    expect(counter).toBe(100)

    e1.removeAllListeners()
    void e1.emit('a') // no listeners!
    expect(counter).toBe(100)
  })

  it('should wait on', async () => {
    expect.assertions(2)

    const e1 = new Emitter()

    setTimeout(() => {
      void e1.emit('f', 1)
    }, 100)

    const v = await waitOn(e1, 'f')
    expect(v).toBe(1)

    if (platform.test) {
      await expect(waitOn(e1, 'x', 10)).rejects.toThrow(
        'Did not response in time',
      )
      // } else {
      //   // https://jasmine.github.io/api/3.5/global
      //   await expectAsync(on(e1, "x", 10)).toBeRejectedWithError(
      //     "Did not response in time"
      //   )
    }
  })

  it('should work lazy', async () => {
    const e1 = new Emitter()
    const e2 = new Emitter()

    const on1 = lazyListener(e1)
    const on2 = lazyListener(e2)

    await e1.emit('a', 1)
    await e1.emit('b', 2)

    await e2.emit('a', 3)

    expect(await on2('a')).toBe(3)
    // expect(await on1("a")).toBe(1)
    expect(await on1('b')).toBe(2)
  })

  it('should expect events', async () => {
    expect.assertions(3)

    const e = new Emitter()

    e.on('a', v => expect(v).toBe(1))
    e.on('a', v => expect(v).toBe(1))
    e.on('b', v => expect(v).toBe(1))

    await e.emit('a', 1)
    await e.emit('b', 1)
  })

  it('should expect once', async () => {
    expect.assertions(1)

    const e = new Emitter()

    e.once('a', v => expect(v).toBe(1))

    void e.emit('a', 1)
    void e.emit('a', 2)
    void e.emit('a', 3)
  })

  it('should mock events', async () => {
    const fn = vi.fn()

    const e = new Emitter()

    e.on('a', fn)
    e.on('a', fn)
    e.on('b', fn)

    await e.emit('a', 1)
    await e.emit('b', 1)

    expect(fn).toBeCalledTimes(3)
  })

  it('should work with global listener', async () => {
    const fn = vi.fn()

    const e = getGlobalEmitter()

    e.on('a', fn)
    e.on('a', fn)
    e.on('b', fn)

    await e.emit('a', 1)
    await getGlobalEmitter().emit('b', 2)

    expect(fn).toBeCalledTimes(3)
    expect(fn.mock).toMatchInlineSnapshot(`
      Object {
        "calls": Array [
          Array [
            1,
          ],
          Array [
            1,
          ],
          Array [
            2,
          ],
        ],
        "instances": Array [
          undefined,
          undefined,
          undefined,
        ],
        "invocationCallOrder": Array [
          4,
          5,
          6,
        ],
        "lastCall": Array [
          2,
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
          Object {
            "type": "return",
            "value": undefined,
          },
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `)
  })

  it('should respect priorities', async () => {
    const e = new Emitter()

    const l: any = []

    e.on('p', () => l.push(2), { priority: 100 })
    e.on('p', () => l.push(5), { priority: -1 })
    e.on('p', () => l.push(6), { priority: -2 })
    e.on('p', () => l.push(1), { priority: 110 })
    e.on('p', () => l.push(3))
    e.on('p', () => l.push(4)) // this one has same prio as previous one, but was registered later!

    await e.emit('p')

    expect(l).toEqual([1, 2, 3, 4, 5, 6])
  })
})
