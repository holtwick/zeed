import { valueToString } from '../data/convert'
import { isPromise, tryTimeout } from '../exec/promise'
import { Logger } from '../log'
import type { LogLevelAliasType } from '../log-base'
import type { Json } from '../types'
import { uname, uuid } from '../uuid'
import type { Channel } from './channel'
import type { Encoder } from './encoder'
import { JsonEncoder } from './encoder'

export interface MessageAction {
  name: string
  id: string
  args?: Json[]
}

export interface MessageResult {
  id: string
  result?: Json
  error?: { stack?: string; name: string; message: string }
}

export type Message = MessageAction | MessageResult

export interface MessagesOptions {
  timeout?: number
}

export interface MessagesDefaultMethods<L> {
  dispose(): void
  connect?(channel: Channel): void
  options(opt: MessagesOptions): L
}

export type MessagesMethods<L> = L & MessagesDefaultMethods<L>

// export type MessageDefinitions = {
//   [key: string]: (...args: any) => Promise<any>
// }

export type MessageDefinitions = Record<any, (...args: any) => Promise<any>>

export interface MessageHub {
  dispose(): void
  connect: (newChannel: Channel) => void
  listen<L extends MessageDefinitions>(newHandlers: L): void
  send<L extends MessageDefinitions>(): MessagesMethods<L>
}

// The async proxy, waiting for a response
export const createPromiseProxy = <P extends object>(
  fn: (name: string, args: any[], opt: any) => Promise<unknown>,
  opt: MessagesOptions,
  predefinedMethods: any = {},
): P =>
    new Proxy<P>(predefinedMethods, {
      get: (target: any, name: any) => {
        if (name in target)
          return target[name]
        return (...args: any): any => fn(name, args, opt)
      },
    })

/**
 * RPC
 *
 * Features:
 * - Waits for connection
 * - Retries after fail
 * - Timeouts
 */
export function useMessageHub(
  opt: {
    name?: string
    channel?: Channel
    encoder?: Encoder
    retryAfter?: number
    ignoreUnhandled?: boolean
    debug?: boolean
    logLevel?: LogLevelAliasType
  } = {},
): MessageHub {
  const {
    name = uname('hub'),
    encoder = new JsonEncoder(),
    retryAfter = 1000,
    ignoreUnhandled = true,
    logLevel = false,
  } = opt

  const log = Logger(name, logLevel)

  const handlers = {}
  let channel: Channel | undefined
  const queue: Message[] = []
  let queueRetryTimer: any
  const waitingForResponse: Record<string, [Function, Function]> = {}

  const dispose = () => {
    clearTimeout(queueRetryTimer)
  }

  const postNext = async () => {
    clearTimeout(queueRetryTimer)
    if (channel) {
      if (channel.isConnected) {
        while (queue.length) {
          const message = queue[0]
          try {
            channel.postMessage(await encoder.encode(message))
            queue.shift() // remove from queue when done
          }
          catch (err) {
            log.warn('postMessage', err)
            break
          }
        }
      }
      if (queue.length > 0 && retryAfter > 0)
        queueRetryTimer = setTimeout(postNext, retryAfter)
    }
  }

  const postMessage = async (message: Message) => {
    log('enqueue postMessage', message)
    queue.push(message)
    await postNext()
  }

  const connect = async (newChannel: Channel) => {
    channel = newChannel
    channel.on('connect', postNext)
    channel.on('message', async (msg: any) => {
      log('onmessage', typeof msg)
      const { name, args, id, result, error } = await encoder.decode(msg.data)

      // Incoming new message
      if (name) {
        log(`name ${name} id ${id}`)
        try {
          // @ts-expect-error xxx
          if (handlers[name] == null)
            throw new Error(`handler for ${name} was not found`)

          // @ts-expect-error xxx
          let result = handlers[name](...args)
          if (isPromise(result))
            result = await result
          log(`result ${result}`)
          if (id)
            postMessage({ id, result })
        }
        catch (error) {
          const err
            = error instanceof Error ? error : new Error(valueToString(error))
          log.warn('execution error', err.name)
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
          if (result === undefined)
            log(`skip response for ${id}`)
          else
            log.warn(`no response hook for ${id}`)
        }
        else {
          const [resolve, reject] = waitingForResponse[id]
          if (resolve && reject) {
            delete waitingForResponse[id]
            if (error) {
              const err = new Error(error.message)
              err.stack = error.stack
              err.name = error.name
              log.warn('reject', err.name)
              reject(err)
            }
            else {
              log('resolve', result)
              resolve(result)
            }
          }
        }
      }

      // Don't know what to do with it
      else if (!ignoreUnhandled) {
        log.warn('Unhandled message', msg)
      }
    })

    postNext()
  }

  const fetchMessage = async (
    name: string,
    args: any[],
    opt: MessagesOptions = {},
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
        (resolve, reject) => (waitingForResponse[id] = [resolve, reject]),
      ),
      timeout,
    )
  }

  if (opt.channel)
    connect(opt.channel)

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
