// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { isPromise } from "./promise"

export type Mutex = (fn: Function, elseFn?: Function) => boolean
export type AsyncMutex = (fn: Function, elseFn?: Function) => Promise<boolean>

export function useMutex(): Mutex {
  let token = true
  return (fn, elseFn) => {
    let executed = false
    if (token) {
      token = false
      try {
        fn()
        executed = true
      } finally {
        token = true
      }
    } else if (elseFn !== undefined) {
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
        let result = fn()
        if (isPromise(result)) await result
        executed = true
      } finally {
        token = true
      }
    } else if (elseFn !== undefined) {
      let result = elseFn()
      if (isPromise(result)) await result
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
