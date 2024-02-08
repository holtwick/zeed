// From https://github.com/antfu/birpc/blob/main/src/index.ts MIT

import { createPromise } from '../exec/promise'
import type { LoggerInterface } from '../log/log-base'
import type { Pipe } from './pipe'

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

enum RPCMode {
  request = 1,
  event = 2,
  resolve = 3,
  reject = 4,
}

type RPCMessage = [
  RPCMode,
  number,
  string | any,
  ...any,
]

const defaultSerialize = (i: any) => i
const defaultDeserialize = defaultSerialize

function setupRPCBasic(options: RPCOptionsBasic, functions: any, eventNames: string[] = []) {
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
  } = options

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
      if (mode === RPCMode.request || mode === RPCMode.event) {
        let result, error: any
        if (method != null) {
          try {
            const fn = functions[method] as Function
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
          if (mode === RPCMode.reject)
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
    get(_: any, method: string) {
      const sendEvent = async (...args: any[]) => await post(await serialize([RPCMode.event, method, ...args]))

      if (onlyEvents || eventNames.includes(method)) {
        sendEvent.asEvent = sendEvent
        return sendEvent
      }

      const sendCall = async (...args: any[]) => {
        const [promise, resolve, reject] = createPromise()
        const id = rpcCounter++

        let timeoutId
        if (timeout >= 0) {
          timeoutId = setTimeout(() => {
            try {
              // Custom onTimeoutError handler can throw its own error too
              onTimeoutError?.(method, args)
              throw new Error(`rpc timeout on calling "${method}"`)
            }
            catch (e) {
              reject(e)
            }
            rpcPromiseMap.delete(id)
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

  return { post, serialize, rpcPromiseMap, proxyHandler }
}

export function useRPC<LocalFunctions, RemoteFunctions = LocalFunctions>(
  functions: LocalFunctions,
  options: RPCOptions<RemoteFunctions>,
): RPCReturn<RemoteFunctions> {
  const { eventNames = [] } = options

  const { proxyHandler } = setupRPCBasic(options, functions, eventNames as any)

  return new Proxy({}, proxyHandler)
}

export function useRPCHub(options: RPCOptionsBasic) {
  const eventNames: string[] = []
  const functions: Record<string, any> = {}

  const { proxyHandler } = setupRPCBasic(options, functions)

  function createRPCProxy() {
    return new Proxy({}, proxyHandler)
  }

  return function<LocalFunctions, RemoteFunctions = LocalFunctions>(
    additionalFunctions?: LocalFunctions,
    additionalEventNames: string[] = [],
  ): RPCReturn<RemoteFunctions> {
    Object.assign(functions, additionalFunctions ?? {})
    // log(`Registered functions:\n${Object.keys(functions).join('\n')}`)
    eventNames.push(...additionalEventNames)
    return createRPCProxy()
  }
}

export type UseRPCHubType = ReturnType<typeof useRPCHub>

// Syntax test case
// const hub: UseRPCHubType = {} as any
// const x = hub({
//   test(name: string): string {
//     return name
//   },
// })
// await x.test('dsd')
