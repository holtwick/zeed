import { Logger } from "../log"
import { uname } from "../uuid"
import { Channel } from "./channel"
import { DefaultListener, Emitter, ListenerSignature } from "./emitter"
import { Encoder, JsonEncoder } from "./encoder"

interface ConnectionConfig {
  channel: Channel
  encoder?: Encoder
  name?: string
}

export class Connection<
  L extends ListenerSignature<L> = DefaultListener
> extends Emitter<L> {
  name: string
  channel: Channel
  encoder: Encoder
  log: any

  get shortId() {
    return this.name.substr(0, 6)
  }

  constructor(opt: ConnectionConfig) {
    super()

    let { name, encoder = new JsonEncoder(), channel } = opt

    this.channel = channel
    this.encoder = encoder

    this.name = name ?? this.channel.id ?? uname("conn")
    this.log = Logger(`${this.shortId}`)

    this.channel.on("connect", () => {
      this.log("channel connected")
    })
    this.channel.on("disconnect", () => {
      this.log("channel disconnected")
    })

    this.channel.on("message", async ({ data }) => {
      let info = await this.encoder.decode(data)
      this.log(`channel message, event=${info?.event}`)
      if (info) {
        const { event, args } = info
        super.emit(event, ...args)
      }
    })
  }

  async emit<U extends keyof L>(
    event: U,
    ...args: Parameters<L[U]>
  ): Promise<boolean> {
    try {
      this.log(`emit(${event})`, args.length)
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
}

export function useConnection<L extends ListenerSignature<L> = DefaultListener>(
  opt: ConnectionConfig
) {
  return new Connection<L>(opt)
}
