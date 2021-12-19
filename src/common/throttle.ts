// General explaination https://css-tricks.com/debouncing-throttling-explained-examples/
// From https://github.com/cowboy/jquery-throttle-debounce
// And https://github.com/wuct/raf-throttle/blob/master/rafThrottle.js

import { Logger } from "./log"

const DEBUG = false
const log = DEBUG ? Logger("zeed:throttle") : () => {}

interface DebounceOptions {
  delay?: number
  trailing?: boolean
  leading?: boolean
}

type DebounceFunction = Function & { cancel: () => void; dispose: () => void }

/**
 * Throttle execution of a function. Especially useful for rate limiting
 * execution of handlers on events like resize and scroll.
 */
export function throttle(
  callback: Function,
  opt: DebounceOptions = {}
): DebounceFunction {
  const { delay = 100, trailing = true, leading = true } = opt

  let timeoutID: any = 0
  let checkpoint = 0
  let visited = 0

  let debugCheckpoint = Date.now()

  function clearExistingTimeout() {
    if (timeoutID) {
      clearTimeout(timeoutID)
      timeoutID = undefined
    }
  }

  function wrapper(this: any, ...arguments_: any[]) {
    const now = Date.now()
    let self = this
    let elapsed = now - checkpoint

    function debugElapsed() {
      const dnow = Date.now()
      return `total ${(dnow - debugCheckpoint).toFixed(1)}ms - elapsed ${(
        dnow - checkpoint
      ).toFixed(1)}ms - visited ${visited}x`
    }

    function exec() {
      visited = 0
      checkpoint = Date.now()
      callback.apply(self, arguments_)
    }

    // Make sure enough time has passed since last call
    if (elapsed > delay || !timeoutID) {
      DEBUG && log("elapsed", debugElapsed())

      // Leading execute once immediately
      if (leading) {
        if (elapsed > delay) {
          DEBUG && log("🚀 leading", debugElapsed())
          exec()
        } else {
          ++visited // at least trigger trailing this way
        }
      }

      const timeout = elapsed > delay ? delay : delay - elapsed
      log(`⏱ start timeout with ${timeout.toFixed(1)}ms}`, debugElapsed())

      // Prepare for next round
      clearExistingTimeout()
      checkpoint = now

      // Delay. We should not get here if timeout has not been reached before
      timeoutID = setTimeout(() => {
        DEBUG && log("⏱ reached timeout", debugElapsed())
        timeoutID = 0
        // Only execute on trailing or when visited again, but do not twice if leading
        if (trailing && (!leading || visited > 0)) {
          DEBUG && log("🚀 trailing", debugElapsed())
          exec()
        }
      }, timeout)
    } else {
      // Count visits
      ++visited
      DEBUG && log("visited", debugElapsed())
    }
  }

  wrapper.cancel = clearExistingTimeout
  wrapper.dispose = clearExistingTimeout
  return wrapper
}

// /**
//  * Debounce execution of a function. Debouncing, unlike throttling,
//  * guarantees that a function is only executed a single time, either at the
//  * very beginning of a series of calls, or at the very end.
//  */
// export function debounce(
//   callback: Function,
//   opt: DebounceOptions = {}
// ): DebounceFunction {
//   opt.debounceMode = true
//   return throttle(callback, opt)
// }

// export function throttleAnimationFrame(callback: Function): DebounceFunction {
//   let requestId: any
//   let lastArgs: any

//   const later = (context: any) => () => {
//     requestId = undefined
//     callback.apply(context, lastArgs)
//   }

//   const throttled = function (this: any, ...args: any) {
//     lastArgs = args
//     if (requestId == null) {
//       requestId = requestAnimationFrame(later(this))
//     }
//   }

//   throttled.cancel = throttled.dispose = () => {
//     cancelAnimationFrame(requestId)
//     requestId = undefined
//   }

//   return throttled
// }

// // https://github.com/vueuse/vueuse/blob/main/packages/shared/utils/filters.ts#L103

// /**
//  * Create an EventFilter that throttle the events
//  *
//  * @param delay
//  * @param [trailing=true]
//  * @param [leading=true]
//  */
// export function throttleFilter(delay: number, trailing = true, leading = true) {
//   let lastExec = 0
//   let timer: ReturnType<typeof setTimeout> | undefined
//   let preventLeading = !leading

//   const clear = () => {
//     if (timer) {
//       clearTimeout(timer)
//       timer = undefined
//     }
//   }

//   const filter = (invoke: Function) => {
//     const now = Date.now()
//     const elapsed = now - lastExec

//     clear()

//     // delay should be > 0
//     if (delay <= 0) {
//       lastExec = now
//       return invoke()
//     }

//     // delay reached
//     if (elapsed > delay) {
//       lastExec = now
//       if (preventLeading) preventLeading = false
//       else invoke()
//     }

//     if (trailing) {
//       timer = setTimeout(() => {
//         lastExec = Date.now()
//         if (!leading) preventLeading = true
//         clear()
//         invoke()
//       }, delay)
//     }

//     if (!leading && !timer) {
//       timer = setTimeout(() => (preventLeading = true), delay)
//     }
//   }

//   return filter
// }
