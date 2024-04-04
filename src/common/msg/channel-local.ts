import { uuid } from '../uuid'
import { Channel } from './channel'

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
