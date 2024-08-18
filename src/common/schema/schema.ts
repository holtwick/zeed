import { isBoolean, isFunction, isNumber, isObject, isString } from '../data'
import type { ObjectInput, ObjectOutput, Type, TypeProps } from './types'

// Helper

function preParse<T>(obj: T, info: Type<T>): T {
  if (obj == null) {
    if (info._default != null) {
      if (isFunction(info._default))
        obj = info._default()
      else
        obj = info._default
    }
  }
  if (obj == null && info._optional === true)
    return undefined as any
  if (obj == null)
    throw new Error('cannot be undefined')
  if (!info._check || info._check(obj))
    return obj
  throw new Error('wrong value')
}

function generic<T = any>(type: string, opt?: Partial<Type<T>>): Type<T> {
  const info: Type<T> = {
    parse(obj) {
      return preParse(obj, this as any)
    },
    ...opt,
    type,
    optional() {
      this._optional = true
      return this as any
    },
    default(value) {
      this._default = value
      return this as any
    },
  }
  return info
}

// Primitives

export function string(opt?: TypeProps) {
  return generic<string>('string', {
    ...opt,
    _check: isString,
  })
}

export function number(opt?: TypeProps) {
  return generic<number>('number', {
    ...opt,
    _check: isNumber,
  })
}

export function boolean(opt?: TypeProps) {
  return generic<boolean>('boolean', {
    ...opt,
    _check: isBoolean,
  })
}

// Object

export function object<T extends ObjectInput>(tobj: T, opt?: TypeProps): ObjectOutput<T> {
  const info = generic('object', {
    ...opt,
    _object: tobj,
    parse(obj) {
      if (obj == null && this._optional === true)
        return undefined
      const newObj: any = {}
      if (!isObject(obj))
        return new Error('expected object input')
      if (!isObject(this._object))
        return new Error('expected object definition')
      for (const [key, info] of Object.entries(this._object)) {
        const value = info.parse((obj as any)[key])
        if (value !== undefined)
          newObj[key] = value
      }
      return newObj
    },
  })
  return info
}
