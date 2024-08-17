// Schema implementation inspired by https://github.com/badrap/valita and those similar to zod

import { isBoolean, isFunction, isNumber, isObject, isString } from '../data'

interface TypeProps {
}

type Type<T = unknown> = {
  type: string

  _optional?: boolean
  _default?: T | (() => T)
  _object?: ObjectInput
  _check?: (obj: any) => boolean

  optional: () => Type<T | undefined>
  default: (value: T | (() => T)) => Type<T | undefined>

  parse: (obj: any, opt?: { // todo obj: T ?
    transform?: boolean
    strict?: boolean
  }) => T
} & TypeProps

export type Infer<T> = T extends Type<infer TT> ? TT : never

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

type ObjectInput = Record<string, Type<any>>

type ObjectFixOptional<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K] & {}
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K] & {}
}

type ObjectPretty<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

type ObjectOutput<T extends ObjectInput> = Type<ObjectPretty<ObjectFixOptional<{
  [K in keyof T]: Infer<T[K]>
}>>>

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
