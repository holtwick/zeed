// https://github.com/sindresorhus/is/ MIT
// https://github.com/sindresorhus/ts-extras
// https://github.com/sindresorhus/type-fest
// https://github.com/antfu/utils

export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint

export function isObject(obj: unknown): obj is object {
  return obj != null && typeof obj === "object"
}

export function isPrimitive(obj: unknown): obj is Primitive {
  return Object(obj) !== obj
}

export function isArray(obj: unknown): obj is Array<any> {
  return Array.isArray(obj)
}

export function isRecord(obj: unknown): obj is Record<string, any> {
  return isObject(obj) && !isArray(obj)
}

export function isString(obj: unknown): obj is string {
  return typeof obj === "string"
}

export function isNumber(obj: unknown): obj is number {
  return typeof obj === "number"
}

export function isInteger(obj: unknown): obj is number {
  return typeof obj === "number" && Number.isInteger(obj)
}

export function isSafeInteger(obj: unknown): obj is number {
  return typeof obj === "number" && Number.isSafeInteger(obj)
}

export function isBoolean(obj: unknown): obj is boolean {
  return typeof obj === "boolean"
}

export function isNullOrUndefined(obj: unknown): obj is null | undefined {
  return obj == null
}

export function isUint8Array(obj: unknown): obj is Uint8Array {
  return isObject(obj) && obj.constructor.name === "Uint8Array"
}
