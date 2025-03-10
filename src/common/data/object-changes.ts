import { arrayMinus } from './array'
import { deepEqual } from './deep'
import { isRecord } from './is'
import { cloneObject } from './utils'

/**
 * Selective in place update, as minimal as possible.
 * Ideal for reactive objects lie Vue's `reactive`.
 */
export function objectAssignDeepInPlace(toObject: any, fromObject: any) {
  if (isRecord(toObject) && isRecord(fromObject)) {
    // Remove not existing ones
    const fromKeys = Object.keys(fromObject)
    for (const key of arrayMinus(Object.keys(toObject), fromKeys))
      delete toObject[key]

    // Changes
    for (const key of fromKeys) {
      const from = fromObject[key]
      const to = toObject[key]
      if (isRecord(from)) {
        if (isRecord(to))
          objectAssignDeepInPlace(to, from)
        else
          toObject[key] = cloneObject(from)
      }
      else if (from !== to) {
        toObject[key] = from
      }
    }
  }
  return toObject
}

/**
 * Create a minimal change set. Results in a new object, with only the
 * new or changed entries. Deleted entries are marked by value `null`.
 */
export function objectDescribeChange(fromObject: any, toObject: any): any {
  const change: any = {}

  // Deleted attributes
  for (const key of arrayMinus(Object.keys(fromObject), Object.keys(toObject)))
    change[key] = null

  // Changes
  for (const [key, value] of Object.entries(toObject)) {
    const from = fromObject[key]
    if (isRecord(value)) {
      const subChange = objectDescribeChange(from ?? {}, value)
      if (subChange != null)
        change[key] = subChange
    }
    else if (!(value == null && from == null)) {
      if (!deepEqual(value, from))
        change[key] = value == null ? null : value // avoid undefined
    }
  }

  return Object.keys(change).length > 0 ? change : undefined
}

/**
 * Apply the description of changes created by `objectDescribeChange` to the object.
 */
export function objectAssignDescriptionInPlace(toObject: any, fromObject: any) {
  if (isRecord(toObject) && isRecord(fromObject)) {
    const fromKeys = Object.keys(fromObject) 
    for (const key of fromKeys) {
      const from = fromObject[key]
      const to = toObject[key]
      if (from === null) {
        if (to != null) {
          delete toObject[key]
        }
      }
      else if (isRecord(from)) {
        if (isRecord(to))
          objectAssignDescriptionInPlace(to, from)
        else
          toObject[key] = cloneObject(from)
      }
      else if (from !== to) {
        toObject[key] = from
      }
    }
  }
  return toObject
}

