// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-async-promise-executor */

import { Logger } from '../log'

const { warn } = Logger('zeed:promise')

export function createPromise<T>(): [Promise<T>, any, any] {
  let resolve, reject
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })
  return [promise, resolve, reject]
}

/** Sleep for `milliSeconds`. Example 1s: `await sleep(1000)` */
export async function sleep(milliSeconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliSeconds))
}

export async function immediate(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const timeoutReached = Symbol('timeout')

// type Unwrap<T> = T extends Promise<infer U>
//   ? U
//   : T extends (...args: any) => Promise<infer U>
//     ? U
//     : T extends (...args: any) => infer U
//       ? U
//       : T

export async function timeout<T>(
  promise: Promise<T>,
  milliSeconds: number,
  timeoutValue = timeoutReached,
): Promise<T | typeof timeoutValue> {
  return new Promise(async (resolve, reject) => {
    let done = false

    const timeout = setTimeout(() => {
      done = true
      resolve(timeoutValue)
    }, milliSeconds)

    try {
      const result = await promise
      clearTimeout(timeout)
      if (!done)
        resolve(result)
    }
    catch (err) {
      clearTimeout(timeout)
      if (!done)
        reject(err)
    }
  })
}

export const timoutError = new Error('Timeout reached')

export function isTimeout(value: any): boolean {
  return value === timeoutReached || value === timoutError
}

export async function tryTimeout<T>(
  promise: Promise<T>,
  milliSeconds: number,
): Promise<T | undefined> {
  if (milliSeconds <= 0)
    return await promise

  return new Promise(async (resolve, reject) => {
    let done = false

    const timeout = setTimeout(() => {
      done = true
      reject(timoutError)
    }, milliSeconds)

    try {
      const result = await promise
      clearTimeout(timeout)
      if (!done)
        resolve(result)
    }
    catch (err) {
      clearTimeout(timeout)
      if (!done)
        reject(err)
    }
  })
}

/** Wait for `event` on `obj` to emit. Resolve with result or reject on `timeout` */
export function waitOn(
  obj: any,
  event: string,
  timeoutMS = 1000,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const fn = (value: any) => {
      if (timer) {
        clearTimeout(timer)
        done()
        resolve(value)
      }
    }

    let done = () => {
      timer = null
      if (obj.off)
        obj.off(event, fn)
      else if (obj.removeEventListener)
        obj.removeEventListener(event, fn)
      else
        warn('No remove listener method found for', obj, event)
    }

    let timer: any = setTimeout(() => {
      done()
      reject(new Error('Did not response in time'))
    }, timeoutMS)

    if (obj.on)
      obj.on(event, fn)
    else if (obj.addEventListener)
      obj.addEventListener(event, fn)
    else
      warn('No listener method found for', obj)
  })
}

export function isPromise<T>(value: Promise<T> | T): value is Promise<T> {
  return Boolean(
    value
      && (value instanceof Promise
        // @ts-expect-error xxx
        || typeof value.then === 'function'),
  )
}

/** This is exactly what Prose.resolve(x) is supposed to be: return a Promise no matter what type x is */
export function promisify<T>(value: Promise<T> | T): Promise<T> {
  return Promise.resolve(value)
}

// // https://github.com/unjs/items-promise

// /**
//  * Run tasks one by one by calling fn(task, previous) in a promise chain.
//  * Return value is of type Promise<*> which resolves to the last fn result.
//  */
// export async function serial(tasks: any, fn: any) {
//   return tasks.reduce(
//     (promise: Promise<any>, task: any) =>
//       promise.then((previous) => fn(task, previous)),
//     Promise.resolve(null)
//   )
// }

// /**
//  * Run all tasks in parallel by calling fn(tasks) and await using Promise.all.
//  * Return value is of type Promise<*[]> which resolves to results of all fns in an array.
//  */
// export async function parallel(tasks: any[], fn: any): Promise<any[]> {
//   return Promise.all(tasks.map((task) => fn(task)))
// }

//

/**
 *  Like ReturnType but for async functions.
 *  From https://www.jpwilliams.dev/how-to-unpack-the-return-type-of-a-promise-in-typescript
 */
export type AsyncReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
    ? U
    : any
