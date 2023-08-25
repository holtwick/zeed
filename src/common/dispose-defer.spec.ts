// (C)opyright 20210922 Dirk Holtwick, holtwick.it. All rights reserved.

import { DefaultLogger } from "./log"
import { useDefer, useDispose } from './dispose-defer'
import { sleep } from "./exec"

const log = DefaultLogger("dispose-test")

describe('dispose', () => {
  it('should dispose correctly', async () => {
    const disposeCalls: any[] = []
    const dispose = useDispose('a')

    const y = dispose.track({
      dispose() {
        disposeCalls.push(1)
      },
    })
    dispose.track(() => {
      disposeCalls.push(2)
    })

    const x = {
      async dispose() {
        disposeCalls.push(3)
      },
    }
    dispose.track(x)
    dispose.track() // ignore

    dispose.track(async () => {
      disposeCalls.push(4)
    })
    expect(disposeCalls).toEqual([])
    expect(dispose.getSize()).toEqual(4)

    await dispose.untrack(x)
    expect(disposeCalls).toEqual([3])
    expect(dispose.getSize()).toEqual(3)

    await dispose.untrack(x)
    expect(disposeCalls).toEqual([3])
    expect(dispose.getSize()).toEqual(3)

    y?.()
    y?.()
    await dispose.untrack(x)
    expect(disposeCalls).toEqual([3, 1])
    expect(dispose.getSize()).toEqual(2)

    await dispose.dispose()
    expect(disposeCalls).toEqual([3, 1, 4, 2])
    expect(dispose.getSize()).toEqual(0)

    await dispose()
    expect(disposeCalls).toEqual([3, 1, 4, 2])
    expect(dispose.getSize()).toEqual(0)
  })

  it('should be a fancy dispose itself', () => {
    let x = 1
    class Some {
      dispose = useDispose(log)

      constructor() {
        this.dispose.track(() => {
          x = 2
        })
      }
    }

    const obj = new Some()
    expect(x).toBe(1)

    obj.dispose()
    expect(x).toBe(2)
  })

  it('should defer lifo', async () => {
    const stack: string[] = []
    const defer = useDefer({ mode: 'lifo' })
    defer.add(() => stack.push('a'))
    defer.add(() => stack.push('b'))
    defer.add(() => stack.push('c'))
    expect(stack).toEqual([])
    defer(true)
    expect(stack).toEqual(['c', 'b', 'a'])
  })

  it('should defer fifo', async () => {
    const stack: string[] = []
    const defer = useDefer({ mode: 'fifo' })
    defer.add(() => stack.push('a'))
    defer.add(async () => stack.push('b'))
    defer.add(() => stack.push('c'))
    expect(stack).toEqual([])
    await defer()
    expect(stack).toEqual(['a', 'b', 'c'])
  })

  it('should dispose sync', async () => {
    const stack: string[] = []
    const dispose = useDispose()
    dispose.add(() => stack.push('a'))
    dispose.add(() => stack.push('b'))
    dispose.add(() => stack.push('c'))
    expect(stack).toEqual([])
    await dispose(true)
    expect(stack).toEqual(['c', 'b', 'a'])
  })

  it('should dispose sync 2', async () => {
    const stack: string[] = []
    const dispose = useDispose()
    dispose.add(() => stack.push('a'))
    dispose.add(() => stack.push('b'))
    dispose.add(async () => {
      await sleep(1)
      stack.push('c')
    })
    expect(stack).toEqual([])
    expect(dispose.sync).toThrowError() 
    // expect(stack).toEqual(['b', 'a'])
  })

  // TODO future
  // it("should use using", async () => {
  //   class TempFile implements Disposable {

  //     constructor(path: string) {
  //       console.log('constructor')
  //     }
    
  //     [Symbol.dispose]() {
  //       console.log('dispose')
  //     }
  //   }

  //   function fn() {
  //     using f = new TempFile('abc')
  //     console.log('fn return')
  //   }

  //   console.log('fn before')
  //   fn()
  //   console.log('fn after')
  // })
})
