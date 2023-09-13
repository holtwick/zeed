import type { DisposerFunction } from './dispose-types'
import { promisify } from './exec'

export function useTimeout(
  fn: DisposerFunction,
  timeout = 0,
): DisposerFunction {
  let timeoutHandle: any = setTimeout(fn, timeout)
  return () => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
      timeoutHandle = undefined
    }
  }
}

export function useInterval(fn: DisposerFunction, interval: number): DisposerFunction {
  let intervalHandle: any = setInterval(fn, interval)
  return () => {
    if (intervalHandle) {
      clearInterval(intervalHandle)
      intervalHandle = undefined
    }
  }
}

/**
 * The interval starts only, when the function is finished.
 * @param fn
 * @param interval
 * @param immediately
 */
export function useIntervalPause(fn: DisposerFunction, interval: number, immediately = false): DisposerFunction {
  let intervalHandle: any
  let stop = false

  async function loop(exec = false) {
    if (exec)
      await promisify(fn())
    if (!stop)
      intervalHandle = setTimeout(() => loop(true), interval)
  }

  void loop(immediately)

  return () => {
    if (intervalHandle) {
      stop = true
      clearInterval(intervalHandle)
      intervalHandle = undefined
    }
  }
}

export function useEventListener(
  emitter: any,
  eventName: string,
  fn: (ev?: any) => void,
  ...args: any[]
): DisposerFunction {
  if (emitter == null)
    return () => { }
  if (emitter.on)
    emitter.on(eventName, fn, ...args)
  else if (emitter.addEventListener)
    emitter.addEventListener(eventName, fn, ...args)
  return () => {
    if (emitter.off)
      emitter.off(eventName, fn, ...args)
    else if (emitter.removeEventListener)
      emitter.removeEventListener(eventName, fn, ...args)
  }
}
