# Javascript library without `sideEffects`

Some rules to follow to keep code [sideEffects](https://webpack.js.org/guides/tree-shaking/) free, especially with [esbuild](https://esbuild.github.io/api/#ignore-annotations) since it is the foundation of most modern build tools like [vite](https://vitejs.dev/).

## Never use `export enum`

This is a major pain point because it will always create some code, i.e. an object to map values and names to. 

Better use strings, like `type MyStates = 'sleep' | 'code' | 'eat'`.

## Avoid `const x = Infinity`

Don't ask me why, but this always goes into the tree-shaking code. Maybe it is just a bug in `esbuild'.

Use something like `const x = 9007199254740991` instead, if you can. This is `math.pow(2, 53) - 1`.

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

Great abstraction! But will live forever after tree-shaking. Instead, you'll have to do an extra loop and be more dynamic:

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