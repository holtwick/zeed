# Javascript library without `sideEffects`

Some rules to follow to keep code [sideEffects](https://webpack.js.org/guides/tree-shaking/) free, especially with [esbuild](https://esbuild.github.io/api/#ignore-annotations) since it is the foundation of most modern build tools like [vite](https://vitejs.dev/).

## Never use `export enum`

This is a major pain point because it will always create some code, i.e. an object to map values and names to.

Better use strings, like `type MyStates = 'sleep' | 'code' | 'eat'`.

## Avoid `const x = Infinity`

Don't ask me why, but this always goes into the tree shaking code. Maybe it is just a bug in `esbuild`? It will show up as something like `var K = 1 / 0;` in the output, which is an interesting topic in itself that `1/0 === Infinity` ;)

Use something like `const x = 9007199254740991` instead, if it makes sense in your code. This equals `math.pow(2, 53) - 1`.

## Avoid const with function call / instantiation

Defining `const` for primitives (string, number, boolean, etc.) and simple objects is fine, but as soon as a call is involved, this causes problems. Examples:

```ts
// THOSE ARE WRONG!
const argh = new Error('argh error')

const isInteger = Number.isInteger || (num => typeof num === 'number' && isFinite(num) && Math.floor(num) === num)

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER
```

## Lazy initialization

Sometimes you just need one object instance to work with and it logical to use a constant that holds the object, but this is not side effects free:

```ts
export const utf8TextEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null
```

Better access it dynamically through a getter and instantiate on first use. This has only a small overhead. In this example `null` is used to indicate, that the native `TextEncoder` is not available therefore note the comparison with `undefined` (usually we would prefer `== null` in such a scenario):

```ts
let utf8TextEncoder: TextEncoder | undefined | null

export function getUtf8TextEncoder(): TextEncoder | null {
  if (utf8TextEncoder === undefined)
    utf8TextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder() : null)
  return utf8TextEncoder
}
```

## Avoid global factories

You might want to use a fancy factory like

```ts
function makeEncoder(forBits:number) {
  return {
    encode() { /* ... */ },
    decode() { /* ... */ },
  }
}

const { encode: encode64, decode: decode64 } = makeEncoder(64)
```

Great abstraction! But it will live forever after tree-shaking. Instead, you'll have to do an extra loop and be more dynamic:

```ts
let cache

function getEncoder(forBits:number) {
  if (cache == null)
    cache = new Map()

  let obj = cache.get(forBits)
  if (obj == null) {
    obj = makeEncoder(forBits)
    cache.set(forBits, obj)
  }
  return obj
}

function encode64(data) {
  return getEncoder(64).encode(data)
}
```

## Lazy logging

Logging often follows this pattern at the top level of a file:

```ts
const log = Logger("fancy")
```

This is a constant that stays, whether used or not.

Avoid logging or do it lazily inside the function. As for [zeed](https://github.com/holtwick/zeed), I go even further and only use logging if the importing application uses logging, which looks like this

```ts
getGlobalLoggerIfExists()?.('fanzy')?.info('Just FYI')
```

## Conclusion

There are some pitfalls, but by following some coding patterns it is doable and you will be rewarded by minimal code usage. This way I can cram even more code into a single library without worrying about the resulting app size ;)
