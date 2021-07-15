// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from "./log.js"
import { Emitter } from "./emitter.js"
import { cloneObject } from "./utils.js"
import { uuid } from "./uuid.js"

const log = Logger("channel")

type Data = string | Uint8Array

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
  messageerror(event: ChannelMessageEvent): void
}> {
  abstract postMessage(data: any): void
  close() {}
}

/** Very basic channel demonstrating local communication */
export class LocalChannel extends Channel {
  other?: LocalChannel

  postMessage(data: any) {
    this.other?.emit("message", {
      data: cloneObject(data),
      origin: "local",
      lastEventId: uuid(),
    })
  }
}

/** Channel that requires  */
export class CommandChannel {}

// export class Channel {
//   _name = uname(this.constructor.name)
//   _channel?: ChannelTransport
//   // _subscriber

//   buffer: Data[] = []

//   constructor(channel?: SimpleChannel) {
//     if (channel) {
//       this.connect(channel)
//     }
//   }

//   _connectChannel() {
//     log("_connectChannel Channel")
//     this.publishBuffered()
//   }

//   connect(channel: SimpleChannel) {
//     log.assert(channel, "Channel missing")
//     this._channel = channel
//     this._connectChannel()
//   }

//   publishBuffered() {
//     if (this.isConnected()) {
//       log("publishBuffered", this._name)
//       this.buffer.forEach((data) => {
//         log("send buffered", this._name, data)
//         this.send(data)
//       })
//       this.buffer = []
//     }
//   }

//   disconnect() {
//     // this._subscriber = undefined // ?
//     this._channel = undefined
//   }

//   isConnected() {
//     return this._channel != null
//   }

//   encode(obj: Json): Data {
//     return JSON.stringify(obj) // e.g. JSON.stringify
//   }

//   decode(obj: Data): Json {
//     return JSON.parse(obj as string) // e.g. JSON.parse
//   }

//   publish(obj: Json) {
//     const data = this.encode(obj)
//     if (this.isConnected()) {
//       this.send(data)
//     } else {
//       this.buffer.push(data)
//     }
//   }

//   subscribe(fn) {
//     this._subscriber = fn
//   }

//   receive(data: Data) {
//     log("receive", this._name, data)
//     let obj = this.decode(data)
//     if (this._subscriber) {
//       this._subscriber(obj)
//     }
//   }

//   // Override this in a subclass!
//   send(data: Data) {
//     log("send", this._name, data)
//     // this._channel.postMessage(payload)
//     this._channel.receive(data)
//   }
// }

// const HANDSHAKE_PING = "__handshake__ping__"
// const HANDSHAKE_PONG = "__handshake__pong__"

// export class HandshakeChannel extends Channel {
//   _handshake = false

//   isConnected(): boolean {
//     return this._handshake
//   }

//   _connectChannel() {
//     log("_connectChannel HandshakeChannel", this._name)
//     // super._connectChannel()
//     this.send(HANDSHAKE_PING)
//   }

//   receive(data) {
//     log("receive", this._name, data)
//     if (data === HANDSHAKE_PING) {
//       if (this._channel) {
//         this.send(HANDSHAKE_PONG)
//         this._handshake = true
//         this.publishBuffered()
//       }
//     } else if (data === HANDSHAKE_PONG) {
//       if (!this._handshake) {
//         this._handshake = true
//         this.publishBuffered()
//       }
//     } else {
//       super.receive(data)
//     }
//   }
// }

// export class PostChannel extends HandshakeChannel {
//   _connectChannel() {
//     this._channel.addEventListener("message", (e: MessageEvent) =>
//       this.receive(e.data)
//     )
//     super._connectChannel()
//   }

//   send(data) {
//     log("send postChannel", this._name, data)
//     this._channel.postMessage(data)
//   }

//   // Proxy?
//   // Heartbeat?
//   // Error and disconnect handling?
// }

// export class JSONPostChannel extends PostChannel {
//   encode(obj: Json): string {
//     return JSON.stringify(obj)
//   }

//   decode(obj: string): Json {
//     return JSON.parse(obj)
//   }
// }
