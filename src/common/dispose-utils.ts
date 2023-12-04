import type { UseDisposeConfig } from './dispose-defer'
import { useDispose } from './dispose-defer'
import type { DisposerFunction } from './dispose-types'
import { promisify } from './exec'
import type { LoggerInterface } from './log/log-base'

export type TimerExecFunction = () => void | Promise<void>

export function useTimeout(fn: TimerExecFunction, timeout = 0): DisposerFunction {
  let timeoutHandle: any = setTimeout(fn, timeout)
  return () => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
      timeoutHandle = undefined
    }
  }
}

export function useInterval(fn: TimerExecFunction, interval: number): DisposerFunction {
  let intervalHandle: any = setInterval(fn, interval)
  return () => {
    if (intervalHandle) {
      clearInterval(intervalHandle)
      intervalHandle = undefined
    }
  }
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

export function useEventListenerOnce(
  emitter: any,
  eventName: string,
  fn: (ev?: any) => void,
  ...args: any[]
): DisposerFunction {
  if (emitter == null)
    return () => { }
  if (emitter.on)
    emitter.once(eventName, fn, ...args)
  else if (emitter.addEventListener)
    emitter.addEventListener(eventName, fn, ...args)
  return () => {
    if (emitter.off)
      emitter.off(eventName, fn, ...args)
    else if (emitter.removeEventListener)
      emitter.removeEventListener(eventName, fn, ...args)
  }
}

/** Like useDispose but with shorthands for emitter and timers */
export function useDisposeWithUtils(config?: string | UseDisposeConfig | LoggerInterface) {
  const dispose = useDispose(config)
  return Object.assign(dispose, {
    timeout: (fn: TimerExecFunction, timeout = 0) => dispose.add(useTimeout(fn, timeout)),
    interval: (fn: TimerExecFunction, interval = 0) => dispose.add(useInterval(fn, interval)),
    intervalPause: (fn: TimerExecFunction, interval = 0) => dispose.add(useIntervalPause(fn, interval)),
    on: (emitter: any, eventName: string, fn: (ev?: any) => void, ...args: any[]) => dispose.add(useEventListener(emitter, eventName, fn, ...args)),
    once: (emitter: any, eventName: string, fn: (ev?: any) => void, ...args: any[]) => dispose.add(useEventListenerOnce(emitter, eventName, fn, ...args)),
  })
}

export type UseDisposeWithUtils = ReturnType<typeof useDisposeWithUtils>
