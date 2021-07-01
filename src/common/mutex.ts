export type Mutex = (fn: () => void, elseFn?: () => void) => boolean

export function createMutex(): Mutex {
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
