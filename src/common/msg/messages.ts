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

export function useMessages<L extends object>(
  info: {
    channel: Channel
    encoder?: Encoder
    retryAfter?: number
  },
  methods?: L
) {
  const log = Logger(`messages:${uname(!!methods ? "server" : "client")}`)

  const { channel, encoder = new JsonEncoder(), retryAfter = 1000 } = info

  let queue: Message[] = []
  let queueRetryTimer: any

  const postNext = () => {
    clearTimeout(queueRetryTimer)
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

  channel.on("connect", postNext)

  const postMessage = (message: Message) => {
    log("enqueue postMessage", message)
    queue.push(message)
    postNext()
  }

  // Server side

  if (methods) {
    channel.on("message", async (msg: any) => {
      const { name, args, id } = encoder.decode(msg.data) as any
      if (name) {
        log(`name ${name} id ${id}`)
        try {
          // @ts-ignore
          let result = await promisify(methods[name](...args))
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
      }
    })
  }

  let waitingForResponse: any = {}

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

  // The async proxy, waiting for a response
  const createPromiseProxy = (opt: MessagesOptions): L => {
    const { timeout = 5000 } = opt
    return new Proxy<L>({} as any, {
      get: (target: any, name: any) => {
        if (name in target) return target[name]
        return (...args: any): any => {
          if (!methods) {
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
  return createPromiseProxy({})
}
