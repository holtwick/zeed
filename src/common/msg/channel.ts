import { useDispose } from '../dispose-defer'
import { uuid } from '../uuid'
import { Emitter } from './emitter'

/** See http://developer.mozilla.org/en-US/docs/Web/API/MessageEvent */
export interface ChannelMessageEvent<T = any> {
  data: T
  origin?: string
  lastEventId?: string
}

/**
 * Inspired by
 * http://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel
 * https://deno.com/deploy/docs/runtime-broadcast-channel
 */
export abstract class Channel<T = any> extends Emitter<{
  message: (event: ChannelMessageEvent<T>) => void
  messageerror: (event: ChannelMessageEvent<T>) => void // optional
  connect: () => void // optional
  disconnect: () => void // optional
  close: () => void
}> {
  id: string = uuid()
  abstract isConnected?: boolean
  abstract postMessage(data: T): void

  dispose = useDispose()

  /** @deprecated use .dispose() */
  close() {
    void this.dispose()
  }
}
