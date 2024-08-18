import { first, isBoolean, isFunction, isNumber, isObject, isString } from '../data'
import type { ObjectInput, ObjectOutput, Type } from './types'

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
    _check() {
      return true
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
    props(props) {
      this._props = props
      return this as any
    },
  }
  return info
}

// Primitives

export function string() {
  return generic<string>('string', {
    _check: isString,
  })
}

export function number() {
  return generic<number>('number', {
    _check: isNumber,
  })
}

export function boolean() {
  return generic<boolean>('boolean', {
    _check: isBoolean,
  })
}

// Object

export function object<T extends ObjectInput>(tobj: T): ObjectOutput<T> {
  const info = generic('object', {
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

// todo: union and literal

type ExtractLiteral<T> = T extends Type<infer U> ? U : never
type TransformToUnion<T extends (Type<any>)[]> = T extends Array<infer U> ? ExtractLiteral<U> : never

export function union<T extends (Type<any>)[]>(options: T): Type<TransformToUnion<T>> {
  return generic<any>('union', {
    type: first(options)?.type ?? 'any', // todo
    _union: options,
    _check(obj) {
      return this._union?.some(t => t._check(obj)) ?? true
    },
  })
}

type Literal = string | number | bigint | boolean

export function literal<T extends Literal>(value: T): Type<T> {
  return generic<T>('literal', {
    _check: v => v === value,
  })
}
