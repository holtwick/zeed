// Schema implementation inspired by https://github.com/badrap/valita and those similar to zod

import { isBoolean, isNumber, isObject, isString } from '../data'

interface TypeProps {
}

type Type<T = unknown> = {
  optional: () => Type<T | undefined>
  default: (value: T | (() => T)) => Type<T>
  _optional?: boolean
  _default?: T | (() => T)
  type: string
  _object?: ObjectInput
  parse: (obj: T, opt?: {
    transform?: boolean
    strict?: boolean
  }) => boolean
} & TypeProps

export type Infer<T> = T extends Type<infer TT> ? TT : never

// Helper

function generic<T = any>(type: string, opt?: Partial<Type<T>>): Type<T> {
  const info: Type<T> = {
    parse(obj) {
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
      return this
    },
  }
  return info
}

// Primitives

export function string(opt?: TypeProps) {
  return generic<string>('string', {
    ...opt,
    parse(obj) {
      return isString(obj)
    },
  })
}

export function number(opt?: TypeProps) {
  return generic<number>('number', {
    ...opt,
    parse(obj) {
      return isNumber(obj)
    },
  })
}

export function boolean(opt?: TypeProps) {
  return generic<boolean>('boolean', {
    ...opt,
    parse(obj) {
      return isBoolean(obj)
    },
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
      if (!isObject(obj))
        return false
      if (!isObject(this._object))
        return false
      for (const [key, info] of Object.entries(this._object)) {
        const value = (obj as any)[key]
        if (!info.parse(value))
          return false
      }
      return true
    },
  })
  return info
}
