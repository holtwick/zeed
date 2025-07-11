
// import { jsonStringify } from './json'

const TRUE_VALUES_LIST = ['1', 'true', 'yes', 'y', 'on']
const FALSE_VALUES_LIST = ['0', 'false', 'no', 'n', 'off']

/** Like Number.parseFloat, but returning `undefined` instead of `NaN` */
export function parseFloat(value: any): number | undefined {
  try {
    const parsed = Number.parseFloat(value)
    return Number.isNaN(parsed) ? undefined : parsed
  } catch (e) {
    return undefined
  }
}

/** Like Number.parseInt, but returning `undefined` instead of `NaN` */
export function parseInt(value: any, radix = 10): number | undefined {
  try {
    const parsed = Number.parseInt(value, radix)
    return Number.isNaN(parsed) ? undefined : parsed
  } catch (e) {
    return undefined
  }
}


export function stringToBoolean(value?: string, defaultValue = false): boolean {
  if (value == null || typeof value !== 'string')
    return defaultValue
  return TRUE_VALUES_LIST.includes(String(value).trim().toLowerCase())
}

export function stringToInteger(value?: string, defaultValue = 0): number {
  if (value == null || typeof value !== 'string')
    return defaultValue
  return parseInt(value.trim(), 10) ?? defaultValue
}

export function stringToFloat(value?: string, defaultValue = 0.0): number {
  if (value == null || typeof value !== 'string')
    return defaultValue
  return parseFloat(value.trim()) ?? defaultValue
}

/** `true` is a number != 0, a string stating `true`. Otherwise false. */
export function valueToBoolean(value?: any, defaultValue = false): boolean {
  if (value == null)
    return defaultValue
  if (typeof value === 'boolean')
    return value
  if (typeof value === 'number')
    return value !== 0
  return TRUE_VALUES_LIST.includes(String(value).trim().toLowerCase())
}

/** Explicitly has to have a `false` value to become `false`, otherwise `true` */
export function valueToBooleanNotFalse(value?: any, defaultValue = true): boolean {
  if (value == null)
    return defaultValue
  if (typeof value === 'boolean')
    return value
  if (typeof value === 'number')
    return value !== 0
  return !(FALSE_VALUES_LIST.includes(String(value).trim().toLowerCase()))
}

export function valueToInteger(value?: any, defaultValue = 0): number {
  if (value == null)
    return defaultValue
  if (typeof value === 'boolean')
    return value ? 1 : 0
  if (typeof value === 'number')
    return Math.floor(value)
  return parseInt(String(value).trim(), 10) ?? defaultValue
}

export function valueToFloat(value?: any, defaultValue = 0.0): number {
  if (value == null)
    return defaultValue
  if (typeof value === 'boolean')
    return value ? 1 : 0
  if (typeof value === 'number')
    return Math.floor(value)
  return parseFloat(String(value).trim()) ?? defaultValue
}

export function valueToString(value?: any, defaultValue = ''): string {
  if (value == null)
    return defaultValue
  // if (value == "") return defaultValue // ???
  return String(value) ?? defaultValue
}

// todo: toDate, toTimestamp, toData(value, base=64)

// export function mapToObject<T>(map: Map<string, T>): { [key: string]: T } {
//   return Object.fromEntries(map)
// }

// export function objectToMap<T>(obj: { [key: string]: T }): Map<string, T> {
//   return new Map(Object.entries(obj))
// }

// Shortcuts

export const toFloat = valueToFloat
export const toInt = valueToInteger
export const toString = valueToString
export const toBool = valueToBoolean


// Awesome trick from https://stackoverflow.com/a/5396742/140927
export function fixBrokenUtf8String(brokenString: string): string {
  try {
    return decodeURIComponent(escape(brokenString))
  }
  catch (e) {
    // log.debug("fixString failed for", s)
  }
  return brokenString
}
