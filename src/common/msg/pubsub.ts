import { Logger } from "../log"
import { uname } from "../uuid"
import { Channel } from "./channel"
import { DefaultListener, Emitter, ListenerSignature } from "./emitter"
import { Encoder, JsonEncoder } from "./encoder"

interface PubSubConfig {
  channel: Channel
  encoder?: Encoder
  name?: string
  debug?: boolean
}

export class PubSub<
  L extends ListenerSignature<L> = DefaultListener
> extends Emitter<L> {
  name: string
  channel: Channel
  encoder: Encoder
  log: any
  debug: boolean

  get shortId() {
    return this.name.substr(0, 6)
  }

  constructor(opt: PubSubConfig) {
    super()

    let { name, encoder = new JsonEncoder(), channel, debug = false } = opt

    this.channel = channel
    this.encoder = encoder
    this.debug = debug

    this.name = name ?? this.channel.id ?? uname("pubsub")
    this.log = Logger(`${this.shortId}`)

    if (this.debug) {
      this.channel.on("connect", () => {
        this.log("channel connected")
      })
      this.channel.on("disconnect", () => {
        this.log("channel disconnected")
      })
    }

    this.channel.on("message", async ({ data }) => {
      let info = await this.encoder.decode(data)
      if (this.debug)
        this.log(`channel message, event=${info?.event}, info=`, info)
      else this.log(`channel message, event=${info?.event}`)
      if (info) {
        const { event, args } = info
        await this.emitSuper(event, ...args)
      }
    })
  }

  private async emitSuper<U extends keyof L>(
    event: U,
    ...args: Parameters<L[U]>
  ): Promise<boolean> {
    return await super.emit(event, ...args)
  }

  async emit<U extends keyof L>(
    event: U,
    ...args: Parameters<L[U]>
  ): Promise<boolean> {
    try {
      if (this.debug) this.log(`emit(${event})`, event)
      else this.log(`emit(${event})`, args.length)
      if (!this.channel.isConnected) {
        this.log.warn("channel not connected")
        return false
      }
      const data = await this.encoder.encode({ event, args })
      this.channel.postMessage(data)
      return true
    } catch (err) {
      this.log.warn(`emit(${event})`, err)
    }
    return false
  }

  publish = this.emit
  subscribe = this.on
}

export function usePubSub<L extends ListenerSignature<L> = DefaultListener>(
  opt: PubSubConfig
) {
  return new PubSub<L>(opt)
}
