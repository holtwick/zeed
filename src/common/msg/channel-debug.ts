import { Channel } from './channel'

/** Just track messages posted for debug purposes */
export class DebugChannel extends Channel {
  messages: (Uint8Array | string)[] = []

  // constructor() {
  //   super()
  //   this.emit('connect', )
  // }

  postMessage(data: Uint8Array | string): void {
    this.messages.push(data)
  }

  get isConnected() {
    return true
  }
}
