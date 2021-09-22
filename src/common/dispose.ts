import { arrayFilterInPlace } from "./data/array"
import { promisify, isPromise } from "./promise"

type Disposable =
  | Function
  | Promise<unknown>
  | { dispose: Function | Promise<unknown> }

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
