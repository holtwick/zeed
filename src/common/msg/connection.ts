import { Logger } from "../log"
import { uuid } from "../uuid"
import { Channel } from "./channel"
import { DefaultListener, Emitter, ListenerSignature } from "./emitter"

export class Connection<
  L extends ListenerSignature<L> = DefaultListener
> extends Emitter<L> {
  id: string
  channel: Channel
  log: any

  get shortId() {
    return this.id.substr(0, 6)
  }

  constructor(channel: Channel) {
    super()

    this.id = channel.id ?? uuid()
    this.log = Logger(`${this.shortId}`)

    this.channel = channel
    this.channel.on("connect", () => {
      this.log("channel connected")
    })
    this.channel.on("disconnect", () => {
      this.log("channel disconnected")
    })

    this.channel.on("message", ({ data }) => {
      let info = JSON.parse(data)
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
      this.channel.postMessage(JSON.stringify({ event, args }))
      return true
    } catch (err) {
      this.log.warn(`emit(${event})`, err)
    }
    return false
  }
}
