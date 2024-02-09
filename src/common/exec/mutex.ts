import { isPromise } from './promise'

export type Mutex = (fn: (() => void), elseFn?: (() => void)) => boolean
export type AsyncMutex = (fn: (() => void), elseFn?: (() => void)) => Promise<boolean>

export function useMutex(): Mutex {
  let token = true
  return (fn, elseFn) => {
    let executed = false
    if (token) {
      token = false
      try {
        fn()
        executed = true
      }
      finally {
        token = true
      }
    }
    else if (elseFn !== undefined) {
      elseFn()
    }
    return executed
  }
}

export function useAsyncMutex(): AsyncMutex {
  let token = true
  return async (fn, elseFn) => {
    let executed = false
    if (token) {
      token = false
      try {
        const result = fn()
        if (isPromise(result))
          await result
        executed = true
      }
      finally {
        token = true
      }
    }
    else if (elseFn !== undefined) {
      const result = elseFn()
      if (isPromise(result))
        await result
    }
    return executed
  }
}

// export type Lock = ({lock: () => Promise<void>, unlock: () => void})

// export function createLock() {
//   let lockCtr = []
//   return {
//     lock() {

//     },
//     unlock() {

//     }
//   }
// }
