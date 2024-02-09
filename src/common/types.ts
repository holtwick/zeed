export {}

// JSON

// type JsonPrimitive = string | number | boolean | null
// interface JsonMap extends Record<string, JsonPrimitive | JsonArray | JsonMap> {}
// interface JsonArray extends Array<JsonPrimitive | JsonArray | JsonMap> {}
// export type Json =
//   | JsonPrimitive
//   | JsonMap
//   | JsonArray
//   | { [property: string]: Json }
//   | Json[]

// interface JsonInterface {
//   [property: string]: Json | undefined
// }

export type Json =
  | string
  | number
  | boolean
  | null
  | { [property: string]: Json }
  | Json[]
// | JsonInterface

// Implemented by MemStorage, LocalStorage, FileStorage
// Similar to https://github.com/unjs/unstorage
export interface ObjectStorage<T = any> {
  setItem: (key: string, value: T) => void
  getItem: (key: string) => T | undefined
  removeItem: (key: string) => void
  clear: () => void
  allKeys: () => string[]
}

// https://stackoverflow.com/a/68349501/140927
export type NestedArray<T> = T | Array<NestedArray<T>>
