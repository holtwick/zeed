import type { DisposerFunction } from './dispose-types'
import type { LoggerInterface } from './log/log-base'
import { arrayFilterInPlace } from './data/array'
import { isString } from './data/is'
import { isPromise } from './exec/promise'
import { DefaultLogger } from './log/log'

export function polyfillUsing() {
  try {
    // @ts-expect-error just a polyfill
    Symbol.dispose ??= Symbol('Symbol.dispose')
    // @ts-expect-error just a polyfill
    Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose')
  }
  catch (_) { }
}

// Symbol.dispose ??= Symbol('Symbol.dispose')
// Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose')

/** A disposable entry: either a function or an object with a dispose() method. */
type DisposableEntry = DisposerFunction | { dispose: DisposerFunction }

/** Different kinds of implementations have grown, this should unify them  */
function callDisposable(disposable: DisposableEntry): Promise<void> | void {
  let result

  if (typeof disposable === 'function')
    result = disposable()
  else if (typeof disposable.dispose === 'function')
    result = disposable.dispose()

  if (isPromise(result))
    return result
}

export interface UseDisposeConfig {
  name?: string
  log?: LoggerInterface
}

export function useDispose(opt?: string | UseDisposeConfig | LoggerInterface) {
  if (opt != null) {
    if (isString(opt))
      opt = { name: opt }
    else if ('debug' in opt && 'label' in opt)
      opt = { name: opt.label, log: opt }
  }

  polyfillUsing()

  const name = opt?.name
  const log = opt?.log ?? DefaultLogger('zeed:dispose')

  let _disposed = 0

  const tracked: DisposableEntry[] = []

  function untrack(disposable: DisposableEntry): Promise<void> | void {
    if (disposable != null && tracked.includes(disposable)) {
      arrayFilterInPlace(tracked, el => el !== disposable)
      const result = callDisposable(disposable)
      if (isPromise(result))
        return result
    }
  }

  function track(obj?: DisposableEntry): DisposerFunction | undefined {
    if (obj == null)
      return
    tracked.unshift(obj) // LIFO
    return () => untrack(obj)
  }

  /** Dispose all tracked entries */
  function dispose(strictSync = false): Promise<any> | void {
    if (name)
      log.debug(`dispose "${name}": ${tracked.length} entries`)

    _disposed += 1

    const promises: any[] = []
    while (tracked.length > 0) {
      const fn = tracked[0]
      const result = untrack(fn) // LIFO
      if (isPromise(result)) {
        if (strictSync)
          throw new Error(`Async disposable found: ${fn} -> ${result}`)
        else
          promises.push(result)
      }
    }

    if (promises.length > 0)
      return Promise.all(promises)
  }

  /** Dispose all tracked entries in synchronous way. */
  function disposeSync(): void {
    dispose(true)
  }

  return Object.assign(dispose, {
    /** Counter that increments each time dispose has been called */
    get disposed() {
      return _disposed
    },

    add: track,
    remove: untrack,

    /** @deprecated use add */
    track,

    /** @deprecated use remove */
    untrack,

    dispose,
    disposeSync,
    sync: disposeSync,

    /** @deprecated use dispose */
    exec: dispose,
    getSize() {
      return tracked.length
    },
    isDisposed() {
      return _disposed > 0 && tracked.length === 0
    },

    [Symbol.dispose]() {
      return dispose()
    },

    async [Symbol.asyncDispose]() {
      return await dispose()
    },

  })
}

export type UseDispose = ReturnType<typeof useDispose>

export function useDefer(
  config: {
    mode?: 'lifo' | 'fifo'
  } = {},
) {
  const { mode = 'fifo' } = config
  const steps: DisposableEntry[] = []

  polyfillUsing()

  /**
   * Executes all steps. If all steps are not Promises, they are executed immediately,
   * otherwise a Promise is returned.
   * Note: useDefer defaults to FIFO order; use mode: 'lifo' for LIFO (stack) order.
   */
  const exec = async (expectSync = false) => {
    while (steps.length > 0) {
      const step = steps[0]
      arrayFilterInPlace(steps, el => el !== step)
      if (typeof step === 'function') {
        const result = step()
        if (isPromise(result)) {
          if (expectSync) {
            throw new Error(
              `Expected sync only function, but found async: ${step}`,
            )
          }
          await result
        }
      }
      else if (typeof step.dispose === 'function') {
        // Handle objects with a dispose() method (consistent with useDispose)
        const result = step.dispose()
        if (isPromise(result)) {
          if (expectSync) {
            throw new Error(
              `Expected sync only function, but found async: ${step}`,
            )
          }
          await result
        }
      }
      else {
        throw new Error(`Unhandled disposable: ${step}`)
      }
    }
  }

  const add = (obj: DisposableEntry) => {
    if (mode === 'lifo')
      steps.unshift(obj)
    else
      steps.push(obj)
  }

  return Object.assign(exec, {
    add,
    exec,
    getSize() {
      return steps.length
    },
  })
}

export type UseDefer = ReturnType<typeof useDefer>
