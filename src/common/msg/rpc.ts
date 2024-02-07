// From https://github.com/antfu/birpc/blob/main/src/index.ts MIT

import type { LoggerInterface } from '../log/log-base'

export type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never
export type ReturnType<T> = T extends (...args: any) => infer R ? R : never

export interface RPCOptionsBasic {
  /** No return values expected */
  onlyEvents?: boolean
  /** Function to post raw message */
  post: (data: any) => void
  /** Listener to receive raw message */
  on: (fn: (data: any) => void) => void
  /** Custom function to serialize data */
  serialize?: (data: any) => any
  /** Custom function to deserialize data */
  deserialize?: (data: any) => any
  /** Custom logger */
  log?: LoggerInterface
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
  asEvent(...args: ArgumentsType<T>): void
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
  any, // args
  number | undefined | null, // id
  string | undefined | null, // method
]

const defaultSerialize = (i: any) => i
const defaultDeserialize = defaultSerialize

function setupRPCBasic(options: RPCOptionsBasic, functions: any, eventNames: string[] = []) {
  const {
    post,
    on,
    serialize = defaultSerialize,
    deserialize = defaultDeserialize,
    log,
  } = options

  const rpcPromiseMap = new Map<number, { resolve: (...args: any) => any, reject: (...args: any) => any }>()

  on(async (data) => {
    try {
      const msg = deserialize(data) as RPCMessage
      const [mode, args, id, method] = msg
      if (mode === RPCMode.request || mode === RPCMode.event) {
        let result, error: any
        if (method != null) {
          try {
            const fn = functions[method]
            result = await fn(...args)
          }
          catch (e) {
            error = String(e)
          }
        }
        else {
          error = 'Method implementation missing'
        }
        if (error)
          log?.warn('error', msg, error)
        if (mode === RPCMode.request && id) {
          if (error)
            post(serialize([RPCMode.reject, error, id]))
          else
            post(serialize([RPCMode.resolve, result, id]))
        }
      }
      else if (id) {
        const promise = rpcPromiseMap.get(id)
        if (promise != null) {
          if (mode === RPCMode.reject)
            promise.reject(args)
          else promise.resolve(args)
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
      const sendEvent = (...args: any[]) => {
        post(serialize([RPCMode.event, args, null, method]))
      }
      if (options.onlyEvents || eventNames.includes(method)) {
        sendEvent.asEvent = sendEvent
        return sendEvent
      }
      const sendCall = (...args: any[]) => {
        return new Promise((resolve, reject) => {
          const id = rpcCounter++
          rpcPromiseMap.set(id, { resolve, reject })
          post(serialize([RPCMode.request, args, id, method]))
        })
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
