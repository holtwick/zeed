import { arrayFilterInPlace } from "./data/array"
import { promisify, isPromise } from "./promise"

// https://blog.hediet.de/post/the_disposable_pattern_in_typescript

export type DisposerFunction = () => void | Promise<void>

export type Disposer =
  | DisposerFunction
  | {
      dispose?: Function | Promise<unknown>
      cleanup?: Function | Promise<unknown> // deprecated, but used often in my old code
    }

export interface Disposable {
  dispose(): void | Promise<void>
}

/** Different kinds of implementations have grown, this should unify them  */
export async function callDisposer(disposable: Disposer): Promise<void> {
  if (typeof disposable === "function") {
    await promisify(disposable())
  } else if (isPromise(disposable)) {
    await disposable
  } else if (typeof disposable.dispose === "function") {
    await promisify(disposable.dispose())
  } else if (isPromise(disposable.dispose)) {
    await disposable.dispose
  } else if (typeof disposable.cleanup === "function") {
    await promisify(disposable.cleanup())
  } else if (isPromise(disposable.cleanup)) {
    await disposable.cleanup
  }
}

// export function disposeFn()

export function useDisposer() {
  let tracked: Disposer[] = []

  const untrack = async (disposable: Disposer) => {
    if (tracked.includes(disposable)) {
      arrayFilterInPlace(tracked, (el) => el !== disposable)
      await callDisposer(disposable)
    }
  }

  const dispose = async () => {
    while (tracked.length > 0) {
      await untrack(tracked[0]) // LIFO
    }
  }

  const track = (obj: Disposer): DisposerFunction => {
    tracked.unshift(obj) // LIFO
    return () => untrack(obj)
  }

  return Object.assign(dispose, {
    track,
    untrack,
    dispose,
    getSize() {
      return tracked.length
    },
  })
}

export function useTimeout(
  fn: Function,
  timeout: number = 0
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
  if (emitter == null) return () => {}

  if (emitter.on) {
    emitter.on(eventName, fn, ...args)
  } else if (emitter.addEventListener) {
    emitter.addEventListener(eventName, fn, ...args)
  }

  return () => {
    if (emitter.off) {
      emitter.off(eventName, fn, ...args)
    } else if (emitter.removeEventListener) {
      emitter.removeEventListener(eventName, fn, ...args)
    }
  }
}
