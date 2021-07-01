export interface Disposable {
  cleanup(): Promise<void>
}

export interface SortableItem {
  sort_weight: number
}

// JSON

type JsonPrimitive = string | number | boolean | null
interface JsonMap extends Record<string, JsonPrimitive | JsonArray | JsonMap> {}
interface JsonArray extends Array<JsonPrimitive | JsonArray | JsonMap> {}
export type Json = JsonPrimitive | JsonMap | JsonArray
