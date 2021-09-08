// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

export {}

export interface Disposable {
  cleanup(): Promise<void>
}

// JSON

type JsonPrimitive = string | number | boolean | null
interface JsonMap extends Record<string, JsonPrimitive | JsonArray | JsonMap> {}
interface JsonArray extends Array<JsonPrimitive | JsonArray | JsonMap> {}
export type Json = JsonPrimitive | JsonMap | JsonArray

// Implemented by MemStorage, LocalStorage, FileStorage
export interface ObjectStorage {
  setItem(key: string, value: Json): void
  getItem(key: string): Json | undefined
  removeItem(key: string): void
  clear(): void
  allKeys(): string[]
}
