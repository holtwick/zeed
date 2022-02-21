// General explaination https://css-tricks.com/debouncing-throttling-explained-examples/
// From https://github.com/cowboy/jquery-throttle-debounce
// And https://github.com/wuct/raf-throttle/blob/master/rafThrottle.js

import { Logger } from "./log"

const DEBUG = false
const log = DEBUG ? Logger("zeed:throttle") : () => {}

interface ThrottleOptions {
  delay?: number
  trailing?: boolean
  leading?: boolean
}

type ThrottleFunction = Function & { cancel: () => void; dispose: () => void }

interface DebounceOptions {
  delay?: number
}

type DebounceFunction = ThrottleFunction

/**
 * A special throttle implementation that tries to distribute execution
 * in an optimal way.
 *
 * For UI usage the function is executed on first occasion (`leading`).
 * If more calls follow it will again be executed at end (`trailing`).
 * If the next call is inside the timeframe, it is delayed until `trailing`.
 * This avoids timewise too close calls.
 * It is possible to `cancel` the timeout and to `flush` a call, e.g. if
 * leaving UI situation where a final call is required to write data or similar.
 */
export function throttle(
  callback: Function,
  opt: ThrottleOptions = {}
): ThrottleFunction {
  const { delay = 100, trailing = true, leading = true } = opt

  let timeoutID: any = 0
  let checkpoint = 0
  let visited = 0
  let trailingExec: Function | undefined

  let debugCheckpoint = Date.now()

  function clearExistingTimeout() {
    if (timeoutID) {
      clearTimeout(timeoutID)
      timeoutID = undefined
    }
  }

  function wrapper(this: any, ...args: any[]) {
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
      callback.apply(self, args)
    }

    trailingExec = exec

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
      log(`⏱ start timeout with ${timeout.toFixed(1)}ms`, debugElapsed())

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
          trailingExec?.()
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

  // wrapper.flush = () => throw 'todo'

  return wrapper
}

/**
 * Debounce fits best for filtering a large peak of events.
 * For UI event filtering throttle is probably a better choice.
 */
export function debounce(
  callback: Function,
  opt: DebounceOptions = {}
): DebounceFunction {
  const { delay = 100 } = opt
  let timeoutID: any = 0

  function clearExistingTimeout() {
    if (timeoutID) {
      clearTimeout(timeoutID)
      timeoutID = 0
    }
  }

  function wrapper(this: any, ...arguments_: any[]) {
    let self = this
    clearExistingTimeout()
    timeoutID = setTimeout(() => {
      timeoutID = 0
      callback.apply(self, arguments_)
    }, delay)
  }

  wrapper.cancel = clearExistingTimeout
  wrapper.dispose = clearExistingTimeout
  return wrapper
}
