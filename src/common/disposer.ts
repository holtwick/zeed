import { arrayFilterInPlace } from "./data/array"
import { promisify, isPromise } from "./promise"

// https://blog.hediet.de/post/the_disposable_pattern_in_typescript

type Disposable =
  | Function
  | {
      dispose?: Function | Promise<unknown>
      cleanup?: Function | Promise<unknown> // deprecated, but used often in my old code
    }

export function useDisposer() {
  let tracked: Disposable[] = []

  const track = (obj: Disposable) => {
    tracked.unshift(obj) // LIFO
  }

  const untrack = async (disposable: Disposable) => {
    if (tracked.includes(disposable)) {
      arrayFilterInPlace(tracked, (el) => el !== disposable)
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
  }

  const dispose = async () => {
    while (tracked.length > 0) {
      await untrack(tracked[0]) // LIFO
    }
  }

  return {
    track,
    untrack,
    dispose,
    get size() {
      return tracked.length
    },
  }
}

export function useTimeout(fn: Function, timeout: number = 0) {
  let timeoutHandle: any = setTimeout(fn, timeout)
  return () => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
      timeoutHandle = undefined
    }
  }
}

export function useInterval(fn: Function, interval: number) {
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
  fn: (ev?: Event) => void,
  ...args: any[]
) {
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
