// General explaination https://css-tricks.com/debouncing-throttling-explained-examples/
// From https://github.com/cowboy/jquery-throttle-debounce
// And https://github.com/wuct/raf-throttle/blob/master/rafThrottle.js

import { LoggerLazy } from '../log-lazy'
import { promisify } from './promise'

const DEBUG = false
const log = DEBUG ? LoggerLazy('zeed:throttle', 'error') : () => {}

/**
 * A special throttle implementation that tries to distribute execution
 * in an optimal way.
 *
 * **Functionality:** For UI usage the function is executed on first occasion (`leading`).
 * If more calls follow it will again be executed at end (`trailing`).
 * If the next call is inside the timeframe, it is delayed until `trailing`.
 * This avoids timewise too close calls.
 * It is possible to `cancel` the timeout and to `flush` a call, e.g. if
 * leaving UI situation where a final call is required to write data or similar.
 */
export function throttle<F extends (...args: any[]) => any>(
  callback: F,
  opt: {
    delay?: number
    trailing?: boolean
    leading?: boolean
  } = {},
): F & {
    /** Stop all timers, do not exec nothing */
    cancel: () => void

    /** Stop all timers and execute right now. */
    immediate: (...args: Parameters<F>) => Promise<void>

    /** Stop all timers and execute trailing call, if exists. */
    stop: () => void

    dispose: () => void
  } {
  const { delay = 100, trailing = true, leading = true } = opt

  let timeoutID: any = 0
  let checkpoint = 0
  let visited = 0
  let trailingExec: Function | undefined

  const debugCheckpoint = Date.now()

  function clearExistingTimeout() {
    if (timeoutID) {
      clearTimeout(timeoutID)
      timeoutID = undefined
      return true
    }
    return false
  }

  function wrapper(this: any, ...args: any[]) {
    const now = Date.now()
    const elapsed = now - checkpoint

    function debugElapsed() {
      const dnow = Date.now()
      return `total ${(dnow - debugCheckpoint).toFixed(1)}ms - elapsed ${(
        dnow - checkpoint
      ).toFixed(1)}ms - visited ${visited}x`
    }

    const exec = () => {
      visited = 0
      checkpoint = Date.now()
      callback.apply(this, args)
    }

    trailingExec = exec

    // Make sure enough time has passed since last call
    if (elapsed > delay || !timeoutID) {
      DEBUG && log('elapsed', debugElapsed())

      // Leading execute once immediately
      if (leading) {
        if (elapsed > delay) {
          DEBUG && log('🚀 leading', debugElapsed())
          exec()
        }
        else {
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
        DEBUG && log('⏱ reached timeout', debugElapsed())
        timeoutID = 0
        // Only execute on trailing or when visited again, but do not twice if leading
        if (trailing && (!leading || visited > 0)) {
          DEBUG && log('🚀 trailing', debugElapsed())
          trailingExec?.()
        }
      }, timeout)
    }
    else {
      // Count visits
      ++visited
      DEBUG && log('visited', debugElapsed())
    }
  }

  wrapper.cancel = clearExistingTimeout

  wrapper.stop = () => {
    if (clearExistingTimeout() && trailingExec)
      trailingExec()
  }

  wrapper.immediate = async function immediate(this: any, ...args: Parameters<F>[]) {
    clearExistingTimeout()
    checkpoint = Date.now()
    callback.apply(this, args)
  }

  wrapper.dispose = () => wrapper.stop()

  return wrapper as any
}

/**
 * Debounce fits best for filtering a large peak of events.
 * For UI event filtering throttle is probably a better choice.
 *
 * **Functionality:**  It only fires after triggers pause for `delay` ms.
 */
export function debounce<F extends (...args: any[]) => any | Promise<any>>(
  callback: F,
  opt: {
    delay?: number
  } = {},
): F & {
    cancel: () => void
    immediate: (...args: Parameters<F>) => Promise<void>
    dispose: () => void
  } {
  const { delay = 100 } = opt
  let timeoutID: any = 0

  let running = false
  let lastArguments: any[] | undefined

  function clearExistingTimeout() {
    if (timeoutID) {
      log('clear')
      clearTimeout(timeoutID)
      timeoutID = 0
    }
  }

  async function exec() {
    try {
      clearExistingTimeout()
      if (lastArguments != null) {
        log('exec')
        const args = [...lastArguments]
        lastArguments = undefined
        running = true
        await promisify(callback(...args))
        running = false
        log('exec done')
        if (lastArguments != null) {
          clearExistingTimeout()
          log('exec trigger next')
          timeoutID = setTimeout(exec, delay)
        }
      }
    }
    catch (err) { }
  }

  function wrapper(this: any, ...args: any[]) {
    lastArguments = [...args]
    clearExistingTimeout()
    log('trigger')
    if (running === false)
      timeoutID = setTimeout(exec, delay)
  }

  async function immediate(this: any, ...args: any[]) {
    clearExistingTimeout()
    lastArguments = [...args]
    await exec()
  }
  wrapper.cancel = clearExistingTimeout
  wrapper.dispose = clearExistingTimeout
  wrapper.immediate = immediate

  return wrapper as any
}
