// From https://github.com/antfu/birpc/blob/main/src/index.ts MIT

export type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never
export type ReturnType<T> = T extends (...args: any) => infer R ? R : never

export interface RPCOptions<Remote> {
  /** No return values expected */
  onlyEvents?: boolean
  /** Names of remote functions that do not need response. */
  eventNames?: (keyof Remote)[]
  /** Function to post raw message */
  post: (data: any) => void
  /** Listener to receive raw message */
  on: (fn: (data: any) => void) => void
  /** Custom function to serialize data */
  serialize?: (data: any) => any
  /** Custom function to deserialize data */
  deserialize?: (data: any) => any
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

export function useRPC<RemoteFunctions = {}, LocalFunctions = {}>(
  functions: LocalFunctions,
  options: RPCOptions<RemoteFunctions>,
): RPCReturn<RemoteFunctions> {
  const {
    post,
    on,
    eventNames = [],
    serialize = defaultSerialize,
    deserialize = defaultDeserialize,
  } = options

  const rpcPromiseMap = new Map<
    number,
    { resolve: (...args: any) => any; reject: (...args: any) => any }
  >()

  on(async (data) => {
    const msg = deserialize(data) as RPCMessage
    const [mode, args, id, method] = msg
    if (mode === RPCMode.request || mode === RPCMode.event) {
      let result, error: any
      if (method != null) {
        try {
          // @ts-expect-error xxx
          result = await functions[method](...args)
        }
        catch (e) {
          error = String(e)
        }
      }
      else {
        error = 'Method implementation missing'
      }
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
  })

  return new Proxy(
    {},
    {
      get(_, method) {
        const sendEvent = (...args: any[]) => {
          post(serialize([RPCMode.event, args, null, method]))
        }
        if (options.onlyEvents || eventNames.includes(method as any)) {
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
    },
  ) as any
}
