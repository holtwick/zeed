// General explaination https://css-tricks.com/debouncing-throttling-explained-examples/
// From https://github.com/cowboy/jquery-throttle-debounce
// And https://github.com/wuct/raf-throttle/blob/master/rafThrottle.js

interface DebounceOptions {
  //  A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
  delay?: number

  // Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
  // throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
  // after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
  // the internal counter is reset).
  noTrailing?: boolean

  // If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is false (at end),
  // schedule `callback` to execute after `delay` ms.
  debounceMode?: boolean
}

type DebounceFunction = Function & { cancel: () => void; dispose: () => void }

/*
 * Throttle execution of a function. Especially useful for rate limiting
 * execution of handlers on events like resize and scroll.
 */
export function throttle(
  callback: Function,
  opt: DebounceOptions = {}
): DebounceFunction {
  /*
   * After wrapper has stopped being called, this timeout ensures that
   * `callback` is executed at the proper times in `throttle` and `end`
   * debounce modes.
   */
  const { delay = 100, noTrailing = false, debounceMode = false } = opt
  let timeoutID: any
  let cancelled: boolean = false

  // Keep track of the last time `callback` was executed.
  let lastExec = 0

  // Function to clear existing timeout
  function clearExistingTimeout() {
    if (timeoutID) {
      clearTimeout(timeoutID)
    }
  }

  // Function to cancel next exec
  function cancel() {
    clearExistingTimeout()
    cancelled = true
  }

  /*
   * The `wrapper` function encapsulates all of the throttling / debouncing
   * functionality and when executed will limit the rate at which `callback`
   * is executed.
   */
  function wrapper(this: any, ...arguments_: any[]) {
    let self = this
    let elapsed = Date.now() - lastExec

    if (cancelled) {
      return
    }

    // Execute `callback` and update the `lastExec` timestamp.
    function exec() {
      lastExec = Date.now()
      callback.apply(self, arguments_)
    }

    /*
     * If `debounceMode` is true (at begin) this is used to clear the flag
     * to allow future `callback` executions.
     */
    function clear() {
      timeoutID = undefined
    }

    if (debounceMode && !timeoutID) {
      /*
       * Since `wrapper` is being called for the first time and
       * `debounceMode` is true (at begin), execute `callback`.
       */
      exec()
    }

    clearExistingTimeout()

    if (debounceMode === undefined && elapsed > delay) {
      /*
       * In throttle mode, if `delay` time has been exceeded, execute
       * `callback`.
       */
      exec()
    } else if (noTrailing !== true) {
      /*
       * In trailing throttle mode, since `delay` time has not been
       * exceeded, schedule `callback` to execute `delay` ms after most
       * recent execution.
       *
       * If `debounceMode` is true (at begin), schedule `clear` to execute
       * after `delay` ms.
       *
       * If `debounceMode` is false (at end), schedule `callback` to
       * execute after `delay` ms.
       */
      timeoutID = setTimeout(
        debounceMode ? clear : exec,
        debounceMode === undefined ? delay - elapsed : delay
      )
    }
  }

  wrapper.cancel = cancel
  wrapper.dispose = cancel

  // Return the wrapper function.
  return wrapper
}

/*
 * Debounce execution of a function. Debouncing, unlike throttling,
 * guarantees that a function is only executed a single time, either at the
 * very beginning of a series of calls, or at the very end.
 *
 * @param  {number}   delay -         A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param  {boolean}  [atBegin] -     Optional, defaults to false. If atBegin is false or unspecified, callback will only be executed `delay` milliseconds
 *                                  after the last debounced-function call. If atBegin is true, callback will be executed only at the first debounced-function call.
 *                                  (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).
 * @param  {Function} callback -      A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
 *                                  to `callback` when the debounced-function is executed.
 *
 * @returns {Function} A new, debounced function.
 */

export function debounce(
  callback: Function,
  opt: DebounceOptions = {}
): DebounceFunction {
  opt.debounceMode = true
  return throttle(callback, opt)
  // return callback === undefined
  //   ? throttle(delay, atBegin, false)
  //   : throttle(delay, callback, atBegin !== false)
}

export function throttleAnimationFrame(callback: Function): DebounceFunction {
  let requestId: any
  let lastArgs: any

  const later = (context: any) => () => {
    requestId = undefined
    callback.apply(context, lastArgs)
  }

  const throttled = function (this: any, ...args: any) {
    lastArgs = args
    if (requestId == null) {
      requestId = requestAnimationFrame(later(this))
    }
  }

  throttled.cancel = throttled.dispose = () => {
    cancelAnimationFrame(requestId)
    requestId = undefined
  }

  return throttled
}
