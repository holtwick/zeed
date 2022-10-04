---
lastmod: "2021-12-03T17:39:51.376Z"
---

# Messaging

Different **parts of an application** or various locations of **services and clients** need to communicate with each other. Event emitter are a proven concept for in-app communication. But pretty soon tasks become more complex or transport for communication is limited or insecure. These tools try to simplify this task.

We differentiate between the following parts:

- `Emitter`: Classic local event handling
- `Channel`: Simple `postMessage` interface for basic data transport without a protocol
- `PubSub`: Simple one way messages, similar to `Emitter` but using `Channel` as transport
- `Messages`: RPC like interface for communication via `Channel`, awaits response from other side
- `Encoder`: Transform data into a special format for transport like e.g. JSON, encrypted data, etc.

## Channel

Channels are a uniform abstraction for sending and receiving data usually in binary format. It uses the [commonly known `MessageEvent` pattern](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent), with send via `postMessage` and listening on `message`. It is extended to optionally reflect connection states.

```ts
channel.postMessage('Hello World')
channel.on('message', (msg) => {
  log(`Received data=${data}`)
})
```

## PubSub

Same API as `Emitter` for easily sending event like messages via a `Channel`. It is type safe, if you pass an interface as the generic.

```ts
interface MyProtocol {
  doSomething(using: string, count: number): void
}

const hub = usePubSub<MyProtocol>({ channel })

hub.emit('doSomething', 'hello', 2)
hub.on('doSomething', (using, count) => {
  // ...
})
```

You can also use the alternative more PubSub like syntax ;)

```ts
hub.publish('doSomething', 'hello', 2)
hub.subscribe('doSomething', (using, count) => {})
```

## Encoder

Usually data is sent in a binary form. Therefore, an encoding has to transform objects into a form, that both ends can understand. Specific encoders can also apply additional transforms like encryption.

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
  echo(data: any): Promise<any>
  pong(data: any): Promise<void>
}
```

Using the messages is easy:

```ts
const hub = useMessageHub({ channel }).send<MyMessages>()
const echoResponse = await hub.echo({ hello: 'world' })
```

On the receiver part implementation is also straight forward:

```ts
useMessageHub({ channel }).listen<MyMessages>({
  async echo(data) {
    return data
  }
})
```

## Various transports and their properties

<https://developer.mozilla.org/en-US/docs/Glossary/Transferable_objects>

- WebSocket: Supports binary channel, see [zerva-websocket](https://github.com/holtwick/zerva-websocket)
- WebRTC: Supports binary channel
- HTTP: Supports binary channel
- WebWorker: Supports ArrayBuffer
- IFrame
- BroadcastCannel

## Reference

Other projects I learned from, check them out:

- [birpc](https://github.com/antfu/birpc)
