# Messaging

Different **parts of an application** or various locations of **services and clients** need to communicate with each other. Event emitter are a proven concept for in-app communication. But pretty soon tasks become more complex or transport for communication is limited or insecure. These tools try to simplify this task.

We differentiate between the following parts:

- `Emitter`: Classic local event handling
- `Channel`: Simple `postMessage` interface for basic data transport
- `Messages`: Layer on to of `Channel`, same interface as `Emitter`
- `Encoder`: Transform data into a special format for transport like e.g. JSON

## Channel

Channels are a uniform abstraction for sending and receiving data using `postMessage` for sending and listening to `message`.

## Encoder

Usually data should be sent in a binary form. Therefore, an encoding should transfrom objects into a form, that both ends can understand. Encoders could also apply additional transforms like encryption.

## Messages

Messages are a high level abstraction for communicating through channels. They provide additional benefits:

- They always return a response, so the sender knows if the message reached the other participant
- Messages are packed as `Promise`, so you can await results
- The message and the payload are wrapped in a method like structure resulting in a codings style close to locally calling methods on an object
- Timeouts can be set and will throw an error on failure
- If the channel is broken, it is possible to retry sending the message

Messages are defined via `interface`. Typescript checks for valid calls:

```ts
interface MyMessages {
  echo(data: any): void
  pong(data: any): void
}
```

Using the messages is easy:

```ts
let m = new Messages<MyMessages>({ cannel })
m.echo({ hello: "world" })
```

On the receiver part implementation is also straight forward:

```ts
new Messages<MyMessages>(
  { cannel },
  {
    echo(data) {
      return data
    },
  }
)
```

## Various transports and their properties

<http://developer.mozilla.org/en-US/docs/Web/API/Transferable>

- WebSocket: Supports binary channel, see [zerva-websocket](https://github.com/holtwick/zerva-websocket)
- WebRTC: Supports binary channel
- HTTP: Supports binary channel
- WebWorker: Supports ArrayBuffer
- IFrame
- BroadcastCannel
