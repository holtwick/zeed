import { valueToString } from "../data/convert"
import { Logger } from "../log"
import { tryTimeout, isPromise } from "../promise"
import { Json } from "../types"
import { uname, uuid } from "../uuid"
import { Channel } from "./channel"
import { Encoder, JsonEncoder } from "./encoder"

export type MessageAction = {
  name: string
  id: string
  args?: Json[]
}

export type MessageResult = {
  id: string
  result?: Json
  error?: { stack?: string; name: string; message: string }
}

export type Message = MessageAction | MessageResult

export type MessagesOptions = {
  timeout?: number
}

export type MessagesDefaultMethods<L> = {
  dispose(): void
  connect?(channel: Channel): void
  options(opt: MessagesOptions): L
}

export type MessagesMethods<L> = L & MessagesDefaultMethods<L>

export type MessageHub = {
  dispose(): void
  connect: (newChannel: Channel) => void
  listen<L extends object>(newHandlers: L): void
  send<L extends object>(): MessagesMethods<L>
}

// The async proxy, waiting for a response
export const createPromiseProxy = <P extends object>(
  fn: (name: string, args: any[], opt: any) => Promise<unknown>,
  opt: MessagesOptions,
  predefinedMethods: any = {}
): P =>
  new Proxy<P>(predefinedMethods, {
    get: (target: any, name: any) => {
      if (name in target) return target[name]
      return (...args: any): any => fn(name, args, opt)
    },
  })

export function useMessageHub(
  opt: {
    name?: string
    channel?: Channel
    encoder?: Encoder
    retryAfter?: number
    ignoreUnhandled?: boolean
    debug?: boolean
  } = {}
): MessageHub {
  let {
    name = uname("hub"),
    encoder = new JsonEncoder(),
    retryAfter = 1000,
    ignoreUnhandled = true,
  } = opt

  const log = Logger(name)

  let handlers = {}
  let channel: Channel | undefined
  let queue: Message[] = []
  let queueRetryTimer: any
  let waitingForResponse: Record<string, [Function, Function]> = {}

  const dispose = () => {
    clearTimeout(queueRetryTimer)
  }

  const postNext = async () => {
    clearTimeout(queueRetryTimer)
    if (channel) {
      if (channel.isConnected) {
        while (queue.length) {
          let message = queue[0]
          try {
            channel.postMessage(await encoder.encode(message))
            queue.shift() // remove from queue when done
          } catch (err) {
            log.warn("postMessage", err)
            break
          }
        }
      }
      if (queue.length > 0 && retryAfter > 0) {
        queueRetryTimer = setTimeout(postNext, retryAfter)
      }
    }
  }

  const postMessage = (message: Message) => {
    log("enqueue postMessage", message)
    queue.push(message)
    postNext()
  }

  const connect = async (newChannel: Channel) => {
    channel = newChannel
    channel.on("connect", postNext)
    channel.on("message", async (msg: any) => {
      log("onmessage", typeof msg)
      const { name, args, id, result, error } = await encoder.decode(msg.data)

      // Incoming new message
      if (name) {
        log(`name ${name} id ${id}`)
        try {
          // @ts-ignore
          if (handlers[name] == null) {
            throw new Error(`handler for ${name} was not found`)
          }
          // @ts-ignore
          let result = handlers[name](...args)
          if (isPromise(result)) result = await result
          log(`result ${result}`)
          if (id) {
            postMessage({ id, result })
          }
        } catch (error) {
          let err =
            error instanceof Error ? error : new Error(valueToString(error))
          log.warn("execution error", err.name)
          postMessage({
            id,
            error: {
              message: err.message,
              stack: err.stack,
              name: err.name,
            },
          })
        }
      }

      // Incoming new response
      else if (id) {
        log(`response for id=${id}: result=${result}, error=${error}`)
        if (waitingForResponse[id] == null) {
          if (result === undefined) {
            log(`skip response for ${id}`)
          } else {
            log.warn(`no response hook for ${id}`)
          }
        } else {
          const [resolve, reject] = waitingForResponse[id]
          if (resolve && reject) {
            delete waitingForResponse[id]
            if (error) {
              let err = new Error(error.message)
              err.stack = error.stack
              err.name = error.name
              log.warn("reject", err.name)
              reject(err)
            } else {
              log("resolve", result)
              resolve(result)
            }
          }
        }
      }

      // Don't know what to do with it
      else if (!ignoreUnhandled) {
        log.warn("Unhandled message", msg)
      }
    })

    postNext()
  }

  const fetchMessage = async (
    name: string,
    args: any[],
    opt: MessagesOptions = {}
  ): Promise<unknown> => {
    const { timeout = 5000 } = opt
    const id = uuid()
    postMessage({
      name,
      args,
      id,
    })
    return tryTimeout(
      new Promise(
        (resolve, reject) => (waitingForResponse[id] = [resolve, reject])
      ),
      timeout
    )
  }

  if (opt.channel) {
    connect(opt.channel)
  }

  return {
    dispose,
    connect,
    listen<L extends object>(newHandlers: L) {
      Object.assign(handlers, newHandlers)
    },
    send<L extends object>() {
      // The regular proxy without responding, just send
      return createPromiseProxy<L>(fetchMessage, {}, {
        options(perCallopt: MessagesOptions) {
          return createPromiseProxy<L>(fetchMessage, { ...perCallopt })
        },
      } as MessagesDefaultMethods<L>) as MessagesMethods<L>
    },
  }
}
