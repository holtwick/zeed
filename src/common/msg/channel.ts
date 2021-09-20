// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

// import { Logger } from "../log"
import { Emitter } from "./emitter"
import { cloneObject } from "../data/utils"
import { uuid } from "../uuid"

// const log = Logger("zeed:channel")

/** See http://developer.mozilla.org/en-US/docs/Web/API/MessageEvent */
export interface ChannelMessageEvent {
  data: any
  origin?: string
  lastEventId?: string
}

/**
 * Inspired by
 * http://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel
 * https://deno.com/deploy/docs/runtime-broadcast-channel
 * */
export abstract class Channel extends Emitter<{
  message(event: ChannelMessageEvent): void
  messageerror(event: ChannelMessageEvent): void // optional
  connect(): void // optional
  disconnect(): void // optional
  close(): void
}> {
  id: string = uuid()
  abstract isConnected?: boolean
  abstract postMessage(data: any): void
  close() {}
}

/** Very basic channel demonstrating local communication */
export class LocalChannel extends Channel {
  isConnected = true

  other?: LocalChannel

  postMessage(data: any) {
    this.other?.emit("message", {
      data: cloneObject(data),
      origin: "local",
      lastEventId: uuid(),
    })
  }
}

export function fakeWorkerPair(): [LocalChannel, LocalChannel] {
  let w1 = new LocalChannel()
  let w2 = new LocalChannel()

  w1.other = w2
  w2.other = w1

  return [w1, w2]
}
