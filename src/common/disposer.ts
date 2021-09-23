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
  const timeoutHandle = setTimeout(fn, timeout)
  return () => clearTimeout(timeoutHandle)
}

export function useInterval(fn: Function, interval: number) {
  const intervalHandle = setInterval(fn, interval)
  return () => clearInterval(intervalHandle)
}
