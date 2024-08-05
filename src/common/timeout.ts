/**
 * Slightliy enhanced setTimeout to avoid garbage collection issues.
 * Returns a dispose function.
 *
 * Discussion see
 * https://jakearchibald.com/2024/garbage-collection-and-closures/
 * https://news.ycombinator.com/item?id=41111062
 */
export function safeTimeout(fn: () => void, delay = 0, unref = false) {
  let timerId: any

  const disposeTimer = () => {
    clearTimeout(timerId)
    timerId = undefined
  }

  timerId = setTimeout(() => {
    fn()
    disposeTimer()
  }, delay)

  if (unref)
    timerId.unref?.()

  return disposeTimer
}
