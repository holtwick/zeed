// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Channel, ChannelMessageEvent } from "./channel.js"
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

export interface BridgeMessage {
  name: string
  info: any
  responseName?: string
  success?: boolean
  error?: string | null | undefined
  requestPayload?: any
}

interface BrideOptions {
  timeout?: number
}

export class Bridge<L extends ListenerSignature<L> = DefaultListener> {
  channel: Channel

  encoder = new Encoder()
  queue = new SerialQueue()

  subscribers: any = {}
  subscribersOnAny: any[] = []

  opt: BrideOptions

  constructor(channel: Channel, opt: BrideOptions = {}) {
    this.opt = opt
    this.channel = channel
    this.channel.on("message", (event) => this._recv(event))
    this.channel.on("messageerror", (event) => {
      log.error("Error in channel", event)
    })
  }

  private _post(msg: BridgeMessage) {
    this.channel.postMessage(this.encoder.encode(msg))
  }

  private _recv(ev: ChannelMessageEvent) {
    let msg = this.encoder.decode(ev.data) as BridgeMessage

    const event = msg.name
    const args = msg.info

    let subscribers = (this.subscribers[event] || []) as EmitterHandler[]
    this.subscribersOnAny.forEach((fn) => fn(event, ...args))
    if (subscribers.length > 0) {
      let all = subscribers.map((fn) => {
        try {
          return promisify(fn(...args))
        } catch (err) {
          log.warn("emit warning:", err)
        }
      })
    }
  }

  public emit<U extends keyof L>(event: U, ...args: Parameters<L[U]>): this {
    try {
      this._post({
        name: event as string,
        info: args,
      })
    } catch (err) {
      log.error("emit exception", err)
    }
    return this
  }

  public async fetch<U extends keyof L>(
    event: U,
    ...args: Parameters<L[U]>
  ): Promise<undefined | ReturnType<L[U]>> {
    let result = await this.emit(event, ...args)
    if (Array.isArray(result) && result.length === 1) {
      return result[0]
    }
    return undefined
  }

  public onAny(fn: EmitterHandler): this {
    this.subscribersOnAny.push(fn)
    return this
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

  public once<U extends keyof L>(event: U, listener: L[U]): this {
    const onceListener = async (...args: any[]) => {
      this.off(event, onceListener as any)
      return await promisify(listener(...args))
    }
    this.on(event, onceListener as any)
    return this
  }

  public off<U extends keyof L>(event: U, listener: L[U]): this {
    this.subscribers[event] = (this.subscribers[event] || []).filter(
      (f: any) => listener && f !== listener
    )
    return this
  }

  public removeAllListeners(): this {
    this.subscribers = {}
    return this
  }
}
