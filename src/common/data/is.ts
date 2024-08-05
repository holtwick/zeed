// https://github.com/sindresorhus/is/ MIT
// https://github.com/sindresorhus/ts-extras
// https://github.com/sindresorhus/type-fest
// https://github.com/antfu/utils

import { size } from './utils'

// https://developer.mozilla.org/en-US/docs/Glossary/Primitive
export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint

export function isObject(obj: unknown): obj is object {
  return obj != null && typeof obj === 'object'
}

// eslint-disable-next-line ts/no-unsafe-function-type
export function isFunction(obj: unknown): obj is Function {
  return obj != null && typeof obj === 'function'
}

export function isBinaryArray<T>(obj: unknown): obj is T {
  return obj instanceof Uint8Array
    || obj instanceof Uint8ClampedArray
    || obj instanceof Uint16Array
    || obj instanceof Uint32Array
    || obj instanceof Int8Array
    || obj instanceof Int16Array
    || obj instanceof Int32Array
    || obj instanceof Float32Array
    || obj instanceof Float64Array
    || obj instanceof BigInt64Array
    || obj instanceof BigUint64Array
}

/** Something like number, string, boolean */
export function isPrimitive(obj: unknown): obj is Primitive {
  return Object(obj) !== obj
}

export function isArray(obj: unknown): obj is Array<any> {
  return Array.isArray(obj)
}

/** Object that is not an array. But could also be an object defined by a class. */
export function isRecord(obj: unknown): obj is Record<string, any> {
  return isObject(obj) && !isArray(obj)
}

/** Just data, like constructed via `{...}`. */
export function isRecordPlain(obj: unknown): obj is Record<string, any> {
  return obj?.constructor === Object
}

export function isString(obj: unknown): obj is string {
  return typeof obj === 'string'
}

export function isNumber(obj: unknown): obj is number {
  return typeof obj === 'number' && !Number.isNaN(obj) // wtf! Nan === type number
}

export function isInteger(obj: unknown): obj is number {
  return isNumber(obj) && Number.isInteger(obj)
}

/** Integer with full precision i.e. its value is in the signed 53 bit range.  */
export function isSafeInteger(obj: unknown): obj is number {
  return isNumber(obj) && Number.isSafeInteger(obj)
}

export function isBoolean(obj: unknown): obj is boolean {
  return typeof obj === 'boolean'
}

export function isSymbol(obj: unknown): obj is symbol {
  return typeof obj === 'symbol'
}

/** @deprecated use `isNull` */
export function isNullOrUndefined(obj: unknown): obj is null | undefined {
  return obj == null
}

export function isNull(obj: unknown): obj is null | undefined {
  return obj == null
}
export function isUint8Array(obj: unknown): obj is Uint8Array {
  return isObject(obj) && obj.constructor.name === 'Uint8Array'
}

// https://stackoverflow.com/a/46700791/140927

/** Not `null` or `undefined`, use like `.filter(isNotNull)` */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value != null
}

/** Empty means `null` or `undefined` or object or array without items, use like `.filter(isEmpty)` */
export function isEmpty<T>(value: T | null | undefined): value is T {
  return value == null || value === '' || (isObject(value) && size(value) <= 0)
}

/** Not `null` or `undefined` or object or array without items, use like `.filter(isNotEmpty)` */
export function isNotEmpty<T>(value: T | null | undefined): value is T {
  return !isEmpty(value)
}

/**
 * Not `null` or `undefined` or `false`, use like `.filter(isValue)`.
 * Usefull e.g. on conditional list: `[x && 'value', ...]`
 */
export function isValue<T>(value: T | null | undefined | boolean): value is T {
  return value != null && value !== false && value !== true // todo limit on false?
}

/**
 * Not `null` or `undefined` or `false`, use like `.filter(isValue)`.
 * Usefull e.g. on conditional list: `[x && 'value', ...]`
 */
export function isTruthy<T>(value: T | null | undefined | boolean): value is T {
  return value != null && value !== false && value !== 0 && value !== ''
}
