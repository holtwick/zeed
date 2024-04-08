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

  private postMessageRaw(data: Uint8Array | string): boolean {
    try {
      if (this.channel?.isConnected) {
        this.channel.postMessage(data)
        return true
      }
    }
    catch (err) {
      // log.warn('send failed', err)
    }
    return false
  }

  /** Post all buffered messages */
  flushBuffer() {
    while (this.buffer.length) {
      const data = this.buffer.shift()
      if (data && !this.postMessageRaw(data)) {
        this.buffer.unshift(data)
        break
      }
    }
  }

  /** Reset buffer without force sending */
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

  /** @deprecated use `setChannel(undefined)` */
  deleteChannel() {
    this.setChannel()
  }

  postMessage(data: Uint8Array | string): void {
    this.flushBuffer()
    if (!this.postMessageRaw(data))
      this.buffer.push(data)
  }

  get isConnected() {
    return this.channel?.isConnected === true
  }
}
