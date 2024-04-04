import { useDisposeWithUtils } from '../dispose-utils'
import { Channel } from './channel'

/**
 * Channel that buffers if not connected.
 * The actual channel can be removed and replaced.
 */
export class ResillientChannel extends Channel {
  private channel?: Channel
  private buffer: (Uint8Array | string)[] = []

  dispose = useDisposeWithUtils()

  /** Post all buffered messages */
  flushBuffer() {
    while (this.buffer.length)
      this.channel?.postMessage(this.buffer.shift())
  }

  /** Reset buffer */
  emptyBuffer() {
    this.buffer = []
  }

  /**
   * Set a new channel and flush buffer
   */
  setChannel(channel?: Channel) {
    void this.dispose()
    this.channel = channel
    if (channel) {
      this.dispose.add(channel.on('message', msg => this.emit('message', msg)))
      if (channel.isConnected)
        this.flushBuffer()
      else
        this.dispose.add(channel.on('connect', () => this.flushBuffer()))
      // channel.on('close', () => this.channels.delete(channel))
    }
  }

  deleteChannel() {
    this.setChannel()
  }

  postMessage(data: Uint8Array | string): void {
    if (this.channel?.isConnected)
      this.channel.postMessage(data)
    else
      this.buffer.push(data)
  }

  get isConnected() {
    return this.channel?.isConnected === true
  }
}
