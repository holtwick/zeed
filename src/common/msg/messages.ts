import { valueToString } from "../data/convert"
import { Logger } from "../log"
import { tryTimeout, promisify } from "../promise"
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
  connect(channel: Channel): void
  options(opt: MessagesOptions): L
}

export type MessagesMethods<L> = L & MessagesDefaultMethods<L>

export function useMessages<L extends object>(
  opt: {
    channel?: Channel
    encoder?: Encoder
    handlers?: L
    retryAfter?: number
    ignoreUnhandled?: boolean
  } = {}
): MessagesMethods<L> {
  let {
    handlers,
    encoder = new JsonEncoder(),
    retryAfter = 1000,
    ignoreUnhandled = true,
  } = opt

  const log = Logger(`messages:${uname(!!handlers ? "server" : "client")}`)

  let channel: Channel | undefined
  let queue: Message[] = []
  let queueRetryTimer: any
  let waitingForResponse: any = {}

  const postNext = () => {
    clearTimeout(queueRetryTimer)
    if (channel) {
      if (channel.isConnected) {
        while (queue.length) {
          let message = queue[0]
          try {
            channel.postMessage(encoder.encode(message))
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

  const connect = (newChannel: Channel) => {
    channel = newChannel
    channel.on("connect", postNext)

    // Server side

    if (handlers) {
      channel.on("message", async (msg: any) => {
        const { name, args, id } = encoder.decode(msg.data) as any
        if (name) {
          log(`name ${name} id ${id}`)
          try {
            // @ts-ignore
            let result = await promisify(handlers[name](...args))
            log(`result ${result}`)
            if (id) {
              postMessage({ id, result })
            }
          } catch (error) {
            log("execution error", error)
            let err =
              error instanceof Error ? error : new Error(valueToString(error))
            postMessage({
              id,
              error: {
                message: err.message,
                stack: err.stack,
                name: err.name,
              },
            })
          }
        } else if (!ignoreUnhandled) {
          log.warn("Unhandled message", msg)
        }
      })
    }

    // Client side

    channel.on("message", async (msg: any) => {
      const { name, args, id, result, error } = encoder.decode(msg.data) as any
      if (!name && id) {
        log(`response for id=${id}: result=${result}, error=${error}`)
        const [resolve, reject] = waitingForResponse[id]
        if (resolve && reject) {
          delete waitingForResponse[id]
          if (error) {
            let err = new Error(error.message)
            err.stack = error.stack
            err.name = error.name
            log("reject", err)
            reject(err)
          } else {
            log("resolve", result)
            resolve(result)
          }
        }
      }
    })

    postNext()
  }

  if (opt.channel) {
    connect(opt.channel)
  }

  // The async proxy, waiting for a response
  const createPromiseProxy = (
    opt: MessagesOptions,
    predefinedMethods: any = {}
  ): L => {
    const { timeout = 5000 } = opt
    return new Proxy<L>(predefinedMethods, {
      get: (target: any, name: any) => {
        if (name in target) return target[name]
        return (...args: any): any => {
          if (!handlers) {
            const id = uuid()
            postMessage({ name, args, id })
            return tryTimeout(
              new Promise(
                (resolve, reject) =>
                  (waitingForResponse[id] = [resolve, reject])
              ),
              timeout
            )
          }
        }
      },
    })
  }

  // The regular proxy without responding, just send
  return createPromiseProxy({}, {
    connect,
    options(perCallopt: MessagesOptions) {
      return createPromiseProxy({ ...perCallopt })
    },
  } as MessagesDefaultMethods<L>) as MessagesMethods<L>
}
