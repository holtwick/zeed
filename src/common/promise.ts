// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from "./log.js"

const { warn } = Logger("zeed:promise")

/** Sleep for `milliSeconds`. Example 1s: `await sleep(1000)` */
export async function sleep(milliSeconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliSeconds))
}

export async function immediate(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

export const timeoutReached = Symbol("timeout")

type Unwrap<T> = T extends Promise<infer U>
  ? U
  : T extends (...args: any) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : T

export async function timeout<T>(
  promise: Promise<T>,
  milliSeconds: number,
  timeoutValue = timeoutReached
): Promise<T | typeof timeoutValue> {
  return new Promise(async (resolve, reject) => {
    let done = false

    const timeout = setTimeout(() => {
      done = true
      resolve(timeoutValue)
    }, milliSeconds)

    try {
      let result = await promise
      clearTimeout(timeout)
      if (!done) resolve(result)
    } catch (err) {
      clearTimeout(timeout)
      if (!done) reject(err)
    }
  })
}

export const timoutError = new Error("Timeout reached")

export function isTimeout(value: any): boolean {
  return value === timeoutReached || value === timoutError
}

export async function tryTimeout<T>(
  promise: Promise<T>,
  milliSeconds: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let done = false

    const timeout = setTimeout(() => {
      done = true
      reject(timoutError)
    }, milliSeconds)

    try {
      let result = await promise
      clearTimeout(timeout)
      if (!done) resolve(result)
    } catch (err) {
      clearTimeout(timeout)
      if (!done) reject(err)
    }
  })
}

/** Wait for `event` on `obj` to emit. Resolve with result or reject on `timeout` */
export function waitOn(
  obj: any,
  event: string,
  timeoutMS: number = 1000
): Promise<any> {
  return new Promise((resolve, reject) => {
    let fn = (value: any) => {
      if (timer) {
        clearTimeout(timer)
        done()
        resolve(value)
      }
    }

    let done = () => {
      timer = null
      if (obj.off) {
        obj.off(event, fn)
      } else if (obj.removeEventListener) {
        obj.removeEventListener(event, fn)
      } else {
        warn("No remove listener method found for", obj, event)
      }
    }

    let timer: any = setTimeout(() => {
      done()
      reject(new Error(`Did not response in time`))
    }, timeoutMS)

    if (obj.on) {
      obj.on(event, fn)
    } else if (obj.addEventListener) {
      obj.addEventListener(event, fn)
    } else {
      warn("No listener method found for", obj)
    }
  })
}

/** @deprecated */
export function isPromise<T>(value: Promise<T> | T): value is Promise<T> {
  return Boolean(
    value &&
      (value instanceof Promise ||
        // @ts-ignore
        typeof value.then === "function")
  )
}

/** This is exactly what Prose.resolve(x) is supposed to be: return a Promise no matter what type x is */
export function promisify<T>(value: Promise<T> | T): Promise<T> {
  // return isPromise(value) ? value : Promise.resolve(value)
  return Promise.resolve(value)
}
