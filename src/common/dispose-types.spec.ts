import type { Disposer, DisposerFunction } from './dispose-types'
import { describe, expect, it } from 'vitest'

describe('dispose-types', () => {
  it('disposerFunction type should allow sync and async functions', async () => {
    const sync: DisposerFunction = () => 1
    const asyncFn: DisposerFunction = async () => 2
    expect(sync()).toBe(1)
    await asyncFn().then((res: unknown) => expect(res).toBe(2))
  })

  it('disposer type should allow function or object with dispose', () => {
    const fn: Disposer = () => 'ok'
    const obj: Disposer = { dispose: () => 'disposed' }
    expect(typeof fn).toBe('function')
    expect(typeof obj).toBe('object')
    expect(obj.dispose()).toBe('disposed')
  })
})
