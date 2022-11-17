import { arrayFilterInPlace } from './data/array'
import { isPromise, promisify } from './exec/promise'
import { Logger } from './log'

const log = Logger('zeed:dispose', 'error')

// https://blog.hediet.de/post/the_disposable_pattern_in_typescript

export type DisposerFunction = () => any | Promise<any>

export type Disposer =
  | DisposerFunction
  | {
    dispose?: Function | Promise<unknown>
    cleanup?: Function | Promise<unknown> // deprecated, but used often in my old code
  }

export interface Disposable {
  dispose: UseDispose
}

/** Different kinds of implementations have grown, this should unify them  */
async function callDisposer(disposable: Disposer): Promise<void> {
  if (typeof disposable === 'function')
    await promisify(disposable())

  else if (isPromise(disposable))
    await disposable

  else if (typeof disposable.dispose === 'function')
    await promisify(disposable.dispose())

  else if (isPromise(disposable.dispose))
    await disposable.dispose

  else if (typeof disposable.cleanup === 'function')
    await promisify(disposable.cleanup())

  else if (isPromise(disposable.cleanup))
    await disposable.cleanup
}

// export function disposeFn()

interface UseDisposeConfig {
  name?: string
}

export function useDispose(config?: string | UseDisposeConfig) {
  const { name } = typeof config === 'string' ? { name: config } : config ?? {}

  const tracked: Disposer[] = []

  const untrack = async (disposable: Disposer): Promise<void> => {
    if (disposable != null && tracked.includes(disposable)) {
      arrayFilterInPlace(tracked, el => el !== disposable)
      await callDisposer(disposable)
    }
  }

  /** Dispose all tracked entries */
  const dispose = async (): Promise<void> => {
    if (name)
      log.debug(`dispose ${name}: ${tracked.length} entries`)
    while (tracked.length > 0)
      await untrack(tracked[0]) // LIFO
  }

  const track = (obj?: Disposer): DisposerFunction | undefined => {
    if (obj == null)
      return
    tracked.unshift(obj) // LIFO
    return () => untrack(obj)
  }

  return Object.assign(dispose, {
    track,
    add: track, // ?
    untrack, // ?
    dispose,
    exec: dispose, // ?
    getSize() {
      return tracked.length
    },
  })
}

export type UseDispose = ReturnType<typeof useDispose>

/** @deprecated use `useDispose` instead */
export const useDisposer = useDispose

export function useDefer(
  config: {
    mode?: 'lifo' | 'fifo'
  } = {},
) {
  const { mode = 'fifo' } = config
  const steps: Disposer[] = []

  /**
   * Excutes all steps. If all steps are not Promises, they are executed immediately,
   * otherwise a Promise is returned
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
      else if (isPromise(step)) {
        if (expectSync) {
          throw new Error(
            `Expected sync only function, but found async: ${step}`,
          )
        }
        await step
      }
      else {
        throw new Error(`Unhandled disposable: ${step}`)
      }
    }
  }

  const add = (obj: Disposer) => {
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

export function useTimeout(
  fn: Function,
  timeout = 0,
): DisposerFunction {
  let timeoutHandle: any = setTimeout(fn, timeout)
  return () => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
      timeoutHandle = undefined
    }
  }
}

export function useInterval(fn: Function, interval: number): DisposerFunction {
  let intervalHandle: any = setInterval(fn, interval)
  return () => {
    if (intervalHandle) {
      clearInterval(intervalHandle)
      intervalHandle = undefined
    }
  }
}

export function useEventListener(
  emitter: any,
  eventName: string,
  fn: (ev?: any) => void,
  ...args: any[]
): DisposerFunction {
  if (emitter == null)
    return () => {}

  if (emitter.on)
    emitter.on(eventName, fn, ...args)

  else if (emitter.addEventListener)
    emitter.addEventListener(eventName, fn, ...args)

  return () => {
    if (emitter.off)
      emitter.off(eventName, fn, ...args)

    else if (emitter.removeEventListener)
      emitter.removeEventListener(eventName, fn, ...args)
  }
}
