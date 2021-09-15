# Messaging

Different **parts of an application** or various locations of **services and clients** need to communicate with each other. Event emitter are a proven concept for in-app communication. But pretty soon tasks become more complex or transport for communication is limited or insecure. These tools try to simplify this task.

We differentiate between the following parts:

- `Emitter`: Local event handling
- `Channel`: Simple `postMessage` interface for basic data transport
- `Messages`: Layer on to of `Channel`, same interface as `Emitter`
- `Bridge`: xxx

Messages are defined via `interface`. Typescript checks for valid calls:

```ts
interface MyMessages {
  ping(data: any)
  pong(data: any)
}

let m = Messages<MyMessages>()
m.emit("ping", { hello: "world" })
```

## Various transports and their properties

<http://developer.mozilla.org/en-US/docs/Web/API/Transferable>

- WebSocket: Supports binary channel
- WebRTC: Supports binary channel
- HTTP: Supports binary channel
- WebWorker: Supports ArrayBuffer
- IFrame
- BroadcastCannel
- 