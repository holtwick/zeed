// From https://github.com/antfu/birpc/blob/main/src/index.ts MIT

import type { UseStringHashPool } from '../data/string-hash-pool'
import type { LoggerInterface } from '../log/log-base'
import type { Pipe } from './pipe'
import { createPromise } from '../exec/promise'

export type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never
export type ReturnType<T> = T extends (...args: any) => infer R ? R : never

export interface RPCOptionsBasic extends Pipe {
  /** No return values expected */
  onlyEvents?: boolean
  /** Maximum timeout for waiting for response, in milliseconds */
  timeout?: number
  /** Custom logger */
  log?: LoggerInterface
  /** Custom error handler */
  onError?: (error: Error, functionName: string, args: any[]) => boolean | void
  /** Custom error handler for timeouts */
  onTimeoutError?: (functionName: string, args: any[]) => boolean | void
  /** Throw execptions. Default: true */
  exceptions?: boolean
  /**  */
  stringHashPool?: UseStringHashPool
}

export interface RPCOptions<Remote> extends RPCOptionsBasic {
  // /** No return values expected */
  // onlyEvents?: boolean
  /** Names of remote functions that do not need response. */
  eventNames?: (keyof Remote)[]
}

export interface RPCFn<T> {
  /** Call the remote function and wait for the result. */
  (...args: ArgumentsType<T>): Promise<Awaited<ReturnType<T>>>
  /** Send event without asking for response */
  asEvent: (...args: ArgumentsType<T>) => void
}

export type RPCReturn<RemoteFunctions> = {
  [K in keyof RemoteFunctions]: RPCFn<RemoteFunctions[K]>
}

let rpcCounter = 1

export enum RPCMode {
  request = 1,
  event = 2,
  resolve = 3,
  reject = 4,
}

export type RPCMessage = [
  mode: RPCMode,
  id: number,
  method: string | number | any,
  ...any,
]

const defaultSerialize = (i: any) => i
const defaultDeserialize = defaultSerialize

function setupRPCBasic(options: RPCOptionsBasic, functions: Record<string, (...args: any) => Promise<any>>, eventNames: string[] = []) {
  const {
    log,
    post,
    on,
    serialize = defaultSerialize,
    deserialize = defaultDeserialize,
    timeout = 60e3,
    onError,
    onTimeoutError,
    onlyEvents = false,
    exceptions = true,
    stringHashPool,
  } = options

  if (stringHashPool) {
    Object.keys(functions).forEach(stringHashPool.hash)
  }

  function checkEventNames(eventNames: string[]) {
    // eventNames.forEach((n) => {
    //   if (functions[n] == null)
    //     throw new Error(`event name ${n} has no registered function`)
    // })
  }

  checkEventNames(eventNames)

  function registerFunctions(additionalFunctions: any) {
    Object.assign(functions, additionalFunctions ?? {})
    if (stringHashPool)
      Object.keys(additionalFunctions).forEach(stringHashPool.hash)
  }

  function registerEventNames(additionalEventNames: string[]) {
    checkEventNames(additionalEventNames)
    eventNames.push(...additionalEventNames)
  }

  const rpcPromiseMap = new Map<number, {
    resolve: (...args: any) => any
    reject: (...args: any) => any
    timeoutId: Parameters<typeof clearTimeout>[0]
  }>()

  on(async (data) => {
    try {
      const msg = await deserialize(data) as RPCMessage
      const mode = msg?.[0]
      const id = mode === RPCMode.event ? 0 : msg?.[1]
      const [method, ...args] = msg.slice(mode === RPCMode.event ? 1 : 2)
      const methodName = stringHashPool?.stringForHash(method) ?? method
      if (mode === RPCMode.request || mode === RPCMode.event) {
        let result, error: any
        if (method != null) {
          try {
            const fn = functions[methodName]
            result = await fn(...args)
          }
          catch (e) {
            error = String(e)
          }
        }
        else {
          error = 'Method implementation missing'
        }
        if (error) {
          log?.warn('error', msg, error)
          onError?.(error, method ?? '', args)
        }
        if (id > 0) {
          const data = await serialize(error
            ? [RPCMode.reject, id, error]
            : [RPCMode.resolve, id, result])
          await post(data)
        }
      }
      else if (id) {
        const promise = rpcPromiseMap.get(id)
        if (promise != null) {
          clearTimeout(promise.timeoutId)
          if (mode === RPCMode.reject && exceptions === true)
            promise.reject(method)
          else
            promise.resolve(method)
        }
        rpcPromiseMap.delete(id)
      }
    }
    catch (err) {
      log?.warn('Error on handling RPC data. Invalid?', err, data)
    }
  })

  const proxyHandler = {
    get(_: any, methodName: string) {
      const method = stringHashPool?.hash(methodName) ?? methodName
      const sendEvent = async (...args: any[]) => await post(await serialize([RPCMode.event, method, ...args]))

      if (onlyEvents || eventNames.includes(methodName)) {
        sendEvent.asEvent = sendEvent
        return sendEvent
      }

      const sendCall = async (...args: any[]) => {
        const [promise, resolve, reject] = createPromise()
        const id = rpcCounter++

        let timeoutId: any
        if (timeout >= 0) {
          timeoutId = setTimeout(() => {
            try {
              // Custom onTimeoutError handler can throw its own error too
              onTimeoutError?.(methodName, args)
              throw new Error(`rpc timeout on calling "${methodName}"`)
            }
            catch (e) {
              if (exceptions === true)
                reject(e)
              else
                resolve(undefined)
            }
            rpcPromiseMap.delete(id)

            // Garbage Collection https://jakearchibald.com/2024/garbage-collection-and-closures/
            clearTimeout(timeoutId)
            timeoutId = undefined
          }, timeout).unref?.()
        }

        rpcPromiseMap.set(id, { resolve, reject, timeoutId })
        const data = await serialize([RPCMode.request, id, method, ...args])
        await post(data)
        return promise
      }
      sendCall.asEvent = sendEvent
      return sendCall
    },
  }

  return {
    post,
    serialize,
    rpcPromiseMap,
    proxyHandler,
    registerFunctions,
    registerEventNames,
  }
}

export function useRPC<LocalFunctions, RemoteFunctions = LocalFunctions>(
  functions: LocalFunctions,
  options: RPCOptions<RemoteFunctions>,
): RPCReturn<RemoteFunctions> {
  const { eventNames = [] } = options

  const { proxyHandler } = setupRPCBasic(options, functions as any, eventNames as any)

  return new Proxy({}, proxyHandler)
}

export function useRPCHub(options: RPCOptionsBasic) {
  const eventNames: string[] = []
  const functions: Record<string, any> = {}

  const {
    proxyHandler,
    registerFunctions,
    registerEventNames,
  } = setupRPCBasic(options, functions, eventNames)

  function createRPCProxy() {
    return new Proxy({}, proxyHandler)
  }

  return function<LocalFunctions, RemoteFunctions = LocalFunctions>(
    additionalFunctions?: LocalFunctions,
    additionalEventNames: string[] = [],
  ): RPCReturn<RemoteFunctions> {
    registerFunctions(additionalFunctions ?? {})
    registerEventNames(additionalEventNames)
    return createRPCProxy()
  }
}

export type UseRPCHubType = ReturnType<typeof useRPCHub>

// Syntax test case
// async function _demo() {
//   const hub: UseRPCHubType = {} as any
//   const x = hub({
//     test(name: string): string {
//       return name
//     },
//   })
//   await x.test('dsd')
// }
