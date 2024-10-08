import type { UseDisposeConfig } from './dispose-defer'
import type { DisposerFunction } from './dispose-types'
import type { LoggerInterface } from './log/log-base'
import { useDispose } from './dispose-defer'
import { promisify } from './exec/promise'

export type TimerExecFunction = () => void | Promise<void>

export const noopDisposer: () => DisposerFunction = () => {
  const dispose = () => {}
  dispose[Symbol.dispose] = dispose
  return dispose
}

/**
 * Executes a function after a specified timeout and returns a disposer function
 * that can be used to cancel the timeout.
 *
 * @param fn - The function to execute after the timeout.
 * @param timeout - The timeout duration in milliseconds (default: 0).
 * @returns A disposer function that can be used to cancel the timeout.
 */
export function useTimeout(fn: TimerExecFunction, timeout = 0): DisposerFunction {
  let timeoutHandle: any = setTimeout(fn, timeout)
  const dispose = () => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
      timeoutHandle = undefined
    }
  }
  dispose[Symbol.dispose] = dispose
  return dispose
}

/**
 * Executes a function repeatedly at a specified interval and returns a disposer function
 * that can be used to stop the execution.
 *
 * @param fn - The function to be executed at the specified interval.
 * @param interval - The interval (in milliseconds) at which the function should be executed.
 * @returns A disposer function that can be used to stop the execution of the function.
 */
export function useInterval(fn: TimerExecFunction, interval: number): DisposerFunction {
  let intervalHandle: any = setInterval(fn, interval)
  const dispose = () => {
    if (intervalHandle) {
      clearInterval(intervalHandle)
      intervalHandle = undefined
    }
  }
  dispose[Symbol.dispose] = dispose
  return dispose
}

/** The interval starts only, when the function is finished. */
export function useIntervalPause(fn: TimerExecFunction, interval: number, immediately = false): DisposerFunction {
  let intervalHandle: any
  let stop = false

  async function loop(exec = false) {
    if (exec)
      await promisify(fn())
    if (!stop)
      intervalHandle = setTimeout(() => loop(true), interval)
  }

  void loop(immediately)

  const dispose = () => {
    if (intervalHandle) {
      stop = true
      clearInterval(intervalHandle)
      intervalHandle = undefined
    }
  }
  dispose[Symbol.dispose] = dispose
  return dispose
}

export function useEventListener(
  emitter: any,
  eventName: string,
  fn: (ev?: any) => void,
  ...args: any[]
): DisposerFunction {
  if (emitter == null)
    return noopDisposer()
  if (emitter.on)
    emitter.on(eventName, fn, ...args)
  else if (emitter.addEventListener)
    emitter.addEventListener(eventName, fn, ...args)
  const dispose = () => {
    if (emitter.off)
      emitter.off(eventName, fn, ...args)
    else if (emitter.removeEventListener)
      emitter.removeEventListener(eventName, fn, ...args)
  }
  dispose[Symbol.dispose] = dispose
  return dispose
}

export function useEventListenerOnce(
  emitter: any,
  eventName: string,
  fn: (ev?: any) => void,
  ...args: any[]
): DisposerFunction {
  if (emitter == null)
    return noopDisposer()
  if (emitter.on)
    emitter.once(eventName, fn, ...args)
  else if (emitter.addEventListener)
    emitter.addEventListener(eventName, fn, ...args)
  const dispose = () => {
    if (emitter.off)
      emitter.off(eventName, fn, ...args)
    else if (emitter.removeEventListener)
      emitter.removeEventListener(eventName, fn, ...args)
  }
  dispose[Symbol.dispose] = dispose
  return dispose
}

/** Like useDispose but with shorthands for emitter and timers */
export function useDisposeWithUtils(config?: string | UseDisposeConfig | LoggerInterface) {
  const dispose = useDispose(config)
  return Object.assign(dispose, {
    timeout: (fn: TimerExecFunction, timeout = 0) => dispose.add(useTimeout(fn, timeout))!,
    interval: (fn: TimerExecFunction, interval = 0) => dispose.add(useInterval(fn, interval))!,
    intervalPause: (fn: TimerExecFunction, interval = 0) => dispose.add(useIntervalPause(fn, interval))!,
    on: (emitter: any, eventName: string, fn: (ev?: any) => void, ...args: any[]) => dispose.add(useEventListener(emitter, eventName, fn, ...args))!,
    once: (emitter: any, eventName: string, fn: (ev?: any) => void, ...args: any[]) => dispose.add(useEventListenerOnce(emitter, eventName, fn, ...args))!,
  })
}

export type UseDisposeWithUtils = ReturnType<typeof useDisposeWithUtils>
