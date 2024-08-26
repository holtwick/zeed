import { first, isBoolean, isFunction, isInteger, isNumber, isObject, isString } from '../data'
import type { Type, TypeNames, TypeObject } from './types'

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

function generic<T = any>(type: TypeNames, opt?: Partial<Type<T>>): Type<T> {
  const info: Type<T> = {
    parse(obj) {
      return preParse(obj, this as any)
    },
    map(obj, fn) {
      return fn.call(this, obj, this) ?? obj
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

export function string<T = string>() {
  return generic<T>('string', {
    _check: isString,
  })
}

export function number<T = number>() {
  return generic<T>('number', {
    _check: isNumber,
  })
}

export const float = number

export function int<T = number>() {
  return generic<T>('int', {
    _check: isInteger,
  })
}

export function boolean<T = boolean>() {
  return generic<T>('boolean', {
    _check: isBoolean,
  })
}

// Object

export function object<T>(tobj: T): TypeObject<T> {
  const info = generic('object', {
    _object: tobj as any,
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
    map(obj, fn) {
      const result = fn.call(this as any, obj, this as any)
      if (result !== undefined)
        return result
      const newObj: any = {}
      if (obj) {
        for (const [key, info] of Object.entries(this._object ?? {})) {
          const value = info.map((obj as any)[key], fn)
          if (value !== undefined)
            newObj[key] = value
        }
      }
      return newObj
    },
  })
  return info
}

// Union

type ExtractLiteral<T> = T extends Type<infer U> ? U : never
type TransformToUnion<T extends (Type<any>)[]> = T extends Array<infer U> ? ExtractLiteral<U> : never

export function union<T extends (Type<any>)[]>(options: T): Type<TransformToUnion<T>> {
  return generic<any>(first(options)?.type ?? 'any', {
    _union: options,
    _check(obj) {
      return this._union?.some(t => t._check(obj)) ?? true
    },
  })
}

// Literal

type Literal = string | number | bigint | boolean

export function literal<T extends Literal>(value: T): Type<T> {
  return generic<T>('string', {
    _check: v => v === value,
  })
}

// todo does not work yet
export function stringLiterals<const T extends readonly string[], O = T[number]>(value: T): Type<O> {
  return generic<O>('string', {
    _check: v => value.includes(v),
  })
}

// const x = stringLiterals(['a', 'b'])

// type Status = typeof statusStrings[number]
