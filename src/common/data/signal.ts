import { arrayRemoveElement } from './array'
import { objectPlain } from './object'

export type SignalWatcher<T> = (value: T, oldValue: T) => void

export type Signal<T> = [
  () => T,
  (value: T) => void,
  (fn: SignalWatcher<T>) => () => void,
  (fn: SignalWatcher<T>) => void,
] & {
  get: () => T
  set: (value: T) => void
  on: (fn: SignalWatcher<T>) => () => void
  off: (fn: SignalWatcher<T>) => void
}

/** Super simple signal implementation */
export function useSignal<T = any>(value: T, onChange?: SignalWatcher<T>): Signal<T> {
  let signal = structuredClone(value)

  const watchers: SignalWatcher<T>[] = []

  function off(fn: SignalWatcher<T>) {
    arrayRemoveElement(watchers, fn)
  }

  function on(fn: SignalWatcher<T>) {
    watchers.push(fn)
    return () => off(fn)
  }

  if (onChange)
    watchers.push(onChange)

  const get = () => structuredClone(signal)

  const set = (value: T) => {
    if (value !== signal) {
      const oldValue = signal
      signal = value
      watchers.forEach(fn => fn(value, oldValue))
    }
  }

  const obj: any = [get, set, on, off]
  obj.get = get
  obj.set = set
  obj.on = on
  obj.off = off
  return obj
}
