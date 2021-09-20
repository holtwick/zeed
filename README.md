# 🌱 Zeed Library

> Plant the "zeed" of your next Typescript project and let it grow with this useful lib, providing basic functionalities handy in most projects.

- Strict TypeScript
- Covered by tests
- Universal for node.js and browsers
- No dependencies and lightweight
- Modern ESM, fallback to CommonJS
- Unified logging; various handlers
- Typed events

Get started like this:

```sh
npm i zeed
```

Related projects:

- [zeed-dom](https://github.com/holtwick/zeed-dom)
- [zerva](https://github.com/holtwick/zerva)

## Logging

Powerful logging.

```js
import { Logger } from "zeed"

const log = Logger("app")

log("Debug")
log.info("Log this info")
```

By default, the most suitable log handlers are used, but it is also possible to set (`Logger.setHandlers([handlers])`) or add (`Logger.registerHandler(handler)`) new log handlers. You can choose from:

- `LoggerConsoleHandler(opt)`: Plain basic output via `console` (default)
- `LoggerBrowserHandler(opt)`: Colorful log entries
- `LoggerNodeHandler(opt)`: Colorful logging for node.js
- `LoggerFileHandler(path, opt)`: Write to file

`opt` are general option like `level` for the log level or `filter` for custom filtering (see below). But it can also hold individual settings specific for a log handler.

Write custom ones e.g. for [breadcrumb tracking in Sentry.io](https://gist.github.com/holtwick/949d04151586cec529a671859ebbb650) or showing notifications to users on errors in a UI.

You can use `Logger` in submodules and Zeed will make sure all logging goes through the same handlers, no matter what bundler is used. With `Logger.setLock(true)` any further changes to handlers, factories and log levels can be forbidden, to ensure no conflicting settings with submodules. You should set up the Logging very early in your main project before loading submodules.

By default, in browsers a special handler is activated, which is closely bound to `console` with the nice effect, that source code references in the web console will point to the line where the log statement has been called. This is an example output on Safari:

<img src=".assets/safari-console.png" style="max-width:100%">

Output can be filtered by setting `Logger.setFilter(filter)` following the well known [debug syntax](https://github.com/visionmedia/debug#wildcards). For the browser console you can also set like `localStorage.debug = "*"` or for node console like `process.env.DEBUG = "*"` (or put a `DEBUG="*"` in front of the execution call). `process.env.ZEED` and `localStorage.zeed` supersede `DEBUG`.

Loggers can be extended. `const newLog = log.extend("demo")` will append `:demo` to the current namespace.

If you want to set up your own logging behavior or handlers best practice is to have a separate source file where you define those settings on top level. Then import this file as the very first. All other approaches may result in configurations that to not come in time to affect loggers defined in other modules:

```js
// logging.js

import { Logger, LoggerConsoleHandler } from "zeed"

Logger.setHandlers([LoggerConsoleHandler()])
```

```js
// main.js or similar

import "./logging"
import "anyOtherModuleUsingLogger"
```

> Alternative logging solutions: [debug](https://github.com/visionmedia/debug), [tslog](https://github.com/fullstack-build/tslog), [consola](https://github.com/unjs/consola) or [winston](https://github.com/winstonjs/winston) to name just a few.

## Promise / async / await utilities

Wait for an event via `on` or `addEventListener`, useful in unit tests.

```js
await waitOn(emitter, "action", 1000) // 1000 is optional timeout in ms
```

Wait for milliseconds.

```js
await sleep(1000) // wait 1s
```

Throw an error after timeout of 1 second.

```js
await timeout(asynFn, 1000)
```

If a value is not yet a Promise, wrap it to become one.

```js
await promisify(returnValue)
```

## Unique ID

Get a random unique ID of fixed length of 22 chars (these are 16 bytes = 128 bit, encoded in Base62). According to [Nano ID Collision Calculator](https://zelark.github.io/nano-id-cc/): "~597 billion years needed, in order to have a 1% probability of at least one collision."

```js
const id1 = uuid() // base62 encoded => 22 chars
const id2 = uuidB32() // base32 encoded => 26 chars
```

Get an incremental unique ID for current process with named groups, great for debugging.

```js
uname("something") // => 'something-0'
uname("other") // => 'other-0'
uname("something") // => 'something-1'
```

Sortable unique ID inspired by [go-uuid](https://github.com/rsms/go-uuid). 6 bytes encode time and 10 bytes are random. String is Base62 encoded. Date can be extracted from the ID.

```js
const shortSortableId = suid() // = '000iMi10bt6YK8buKlYPsd'
suidDate(shortSortableId) // = 2021-07-03T22:42:40.727Z
shortSortableId < suid() // = true
```

Overview of available IDs:

- `uuid`
- `uuidB32`
- `suid`
- `quid`: Quick ID great for UI purposes of patter `id-1`, `id-2`, ...
- `uuidv4`: The _classic_ UID like `a7755f8d-ef6f-45e9-8db3-d29347a4a2a1`

## Typed event emitter

Typed and async emitter:

```ts
interface MyEvents {
  inc(count: number): number
}

let counter = 0

const e = new Emitter() < MyEvents > e.on("inc", async (count) => counter + 1)
await e.emit("inc", 1) // counter === 1
```

It is also possible to alternatively use a Proxy called `.call` that makes nice dynamic function calls of the events:

```ts
await e.call.inc(1)
```

We can also alternatively declare the listeners this way:

```ts
e.onCall({
  async inc(count: number): number {
    return counter + 1
  },
})
```

You can also use a global emitter that will be available even over module boundaries:

```ts
declare global {
  interface ZeedGlobalEmitter {
    test(x: string): void
  }
}

getGlobalEmitter().emit("test", "Hello World") // or
getGlobalEmitter().call.test("Hello World")
```

## Messaging

Communicating to servers or other remote parts through messages as if they were methods on a local object in a typesafe way:

```ts
let m = useMessages<MyMessages>({ cannel })
m.echo({ hello: "world" })
```

More on it at [src/common/msg/README.md](./src/common/msg/README.md)

## CRDT compatible sorting

A conflict free sorting algorithm with minimal data changes. Just extend an object from `SortableItem`, which will provide an additional property of type number called `sort_weight`.

```ts
interface Row extends SortedItem {
  id: string
  title: string
}

let rows: Row[] = []

const getSortedRows = () => sortedItems(rows)
```

Use `startSortWeight`, `endSortWeight` and `moveSortWeight` to get initial values for new entries or manipulate existing ones.

> Essays:
>
> - [Holtwick: Smart Reordering for UITableView](https://holtwick.de/en/blog/smart-table-reordering)
> - [Figma: Fractional Indexing](https://www.figma.com/blog/realtime-editing-of-ordered-sequences/#fractional-indexing)
>
> The implementation in Zeed is pretty straight forward, but there are also more sophisticated approaches available as alternatives:
>
> - [Implementing Fractional Indexing](https://observablehq.com/@dgreensp/implementing-fractional-indexing)
> - [fractional-indexing](https://github.com/rocicorp/fractional-indexing) - npm module

## Custom binary data encoding / decoding

Integration of the [base-x](https://github.com/cryptocoinjs/base-x) code to support encoding and decoding to any alphabet, but especially base2, base16 (hex), base32, base62, base64.
Human-readable yet efficient encoding of binary data.

```js
const sample = new UInt8Array([1, 2, 3])
const { encode, decode } = useBase(62)
decode(encode(sample)) === sample // = true
```

## Deeply nested object utilities

Handle complex objects.

```js
deepEqual({ a: { b: 1 } }, { a: { b: 2 } }) // false
deepMerge({ a: { b: 1 } }, { c: 3, a: { d: 4 } }) // {a:{b:1, d:4}, c:4}
```

---

Recommended other collections of common JS utils:

- [lib0](https://github.com/dmonad/lib0)
- [antfu/utils](https://github.com/antfu/utils)
- [vueuse](https://vueuse.org/)
- [unjs](https://github.com/unjs/)

Code integrated from other sources:

- [base-x](https://github.com/cryptocoinjs/base-x/blob/master/ts_src/index.ts) MIT
- [debug](https://github.com/visionmedia/debug) MIT
- [dotenv](https://github.com/motdotla/dotenv) BSD-2
- [filenamify](https://github.com/sindresorhus/filenamify) MIT
- [gravatar](https://github.com/mazondo/gravatarjs/blob/master/gravatar.js) MIT
- [lib0](https://github.com/dmonad/lib0)
