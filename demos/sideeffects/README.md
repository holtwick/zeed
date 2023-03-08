# SideEffects

Some rules to follow to keep code [sideEffects](https://webpack.js.org/guides/tree-shaking/) free, especially with [esbuild](https://esbuild.github.io/api/#ignore-annotations) since it is the foundation of most modern build tools, like [vite](https://vitejs.dev/).

### Never use `export enum`

This is a major pain point, because it will always creates some code i.e. an object to map values and names. 

Better use strings, like `type MyStates = 'sleep' | 'code' | 'eat'`.

### Avoid `const x = Infinity`

Don't ask me why, but this will always go into the tree shaken code. Maybe it is just a bug in `esbuild`.

Instead use something like `const x = 9007199254740991` if you can. This is `Math.pow(2, 53) - 1`.

### Avoid global factories

You might like to have a fancy factory like:

```ts
function makeEncoder(forBits:number) {
  return {
    encode() { /* ... */ },
    decode() { /* ... */ },
  }
}

const { encode: encode64, decode: decode64 } = makeEncoder(64)
```

Great abstraction! But will live forever after tree shake. Instead you'll need to go an extra loop and be more dynamic:

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
  getEncoder(64).encode(data)
}
```

### Lazy Logging 

Logging often follows this pattern on top level of a file:

```ts
const log = Logger("fancy")
```

This is a constant that will stay, used or not. 

Avoid logging or do it lazyly inside of the function. As for [zeed](https://github.com/holtwick/zeed) I go even further and only use logging, if the importing app uses logging, which looks like this:

```ts
getGlobalLoggerIfExists()?.('fanzy')?.info('Just FYI')
```

## Conclusion

There are some pitfalls, but by following some coding patterns it is doable and you will be awarded by minimal code usage. This way I can stuff even more code into a single library without worring about the resulting apps size ;)
