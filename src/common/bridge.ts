import { Channel } from "./channel.js"
import {
  DefaultListener,
  EmitterHandler,
  ListenerSignature,
} from "./emitter.js"
import { Logger } from "./log.js"
import { promisify } from "./promise.js"
import { SerialQueue } from "./queue.js"

const log = Logger("bridge")

export class Encoder {
  encode(data: any) {
    return JSON.stringify(data)
  }

  decode(data: any) {
    return JSON.parse(data)
  }
}

export class Bridge<L extends ListenerSignature<L> = DefaultListener> {
  channel: Channel

  encoder = new Encoder()
  queue = new SerialQueue()

  subscribers: any = {}
  subscribersOnAny: any[] = []

  constructor(channel: Channel) {
    this.channel = channel
  }

  public async emit<U extends keyof L>(
    event: U,
    ...args: Parameters<L[U]>
  ): Promise<boolean> {
    let ok = false
    try {
      let subscribers = (this.subscribers[event] || []) as EmitterHandler[]
      // log.debug("emit", this?.constructor?.name, event, ...args, subscribers)

      this.subscribersOnAny.forEach((fn) => fn(event, ...args))

      if (subscribers.length > 0) {
        let all = subscribers.map((fn) => {
          try {
            return promisify(fn(...args))
          } catch (err) {
            log.warn("emit warning:", err)
          }
        })
        ok = true
        await Promise.all(all)
      }
    } catch (err) {
      log.error("emit exception", err)
    }
    return ok
  }

  public onAny(fn: EmitterHandler) {
    this.subscribersOnAny.push(fn)
  }

  public on<U extends keyof L>(event: U, listener: L[U]) {
    let subscribers = (this.subscribers[event] || []) as EmitterHandler[]
    subscribers.push(listener)
    this.subscribers[event] = subscribers
    return {
      cleanup: () => {
        this.off(event, listener)
      },
    }
  }

  public once<U extends keyof L>(event: U, listener: L[U]) {
    const onceListener = async (...args: any[]) => {
      this.off(event, onceListener as any)
      return await promisify(listener(...args))
    }
    this.on(event, onceListener as any)
  }

  public off<U extends keyof L>(event: U, listener: L[U]): this {
    // log("off", key)
    this.subscribers[event] = (this.subscribers[event] || []).filter(
      (f: any) => listener && f !== listener
    )
    return this
  }

  public removeAllListeners(event?: keyof L): this {
    this.subscribers = {}
    return this
  }
}
