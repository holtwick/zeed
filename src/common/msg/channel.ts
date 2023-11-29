// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { useDispose } from '../dispose-defer'
import { uuid } from '../uuid'
import { Emitter } from './emitter'

// import { Logger } from "../log"
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
 */
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

  dispose = useDispose()

  /** @deprecated use .dispose() */
  close() {
    void this.dispose()
  }
}

/** Very basic channel demonstrating local communication */
export class LocalChannel extends Channel {
  isConnected = true

  other?: LocalChannel

  postMessage(data: any) {
    void this.other?.emit('message', {
      data, // : cloneObject(data),
      origin: 'local',
      lastEventId: uuid(),
    })
  }
}

export function createLocalChannelPair(): [LocalChannel, LocalChannel] {
  const w1 = new LocalChannel()
  const w2 = new LocalChannel()

  w1.other = w2
  w2.other = w1

  return [w1, w2]
}
