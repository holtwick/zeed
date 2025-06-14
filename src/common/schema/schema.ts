// With many, many inspiration from https://github.com/badrap/valita MIT License as of 2024-09-10

import { isArray, isBoolean, isFunction, isInteger, isNumber, isObject, isString } from '../data/is'

export interface TypeProps {
  desc?: string
}

export class Type<T = unknown> { // implements Type<T>
  readonly type

  _default?: T
  _optional?: boolean
  _props?: TypeProps
  _check?: (obj: any) => boolean

  [key: string]: any // Allow dynamic properties

  constructor(name: string, options: Partial<Type<T>>) {
    this.type = name
    Object.assign(this, options)
  }

  /// Marks the type as optional, meaning it can be undefined
  /// This is useful for properties that are not required.
  /// .optional() should be used as last in chain, since it looses the original class type
  optional(): Type<T | undefined> { // todo keep the inherited class type
    this._optional = true
    return this
  }

  /// Sets a default value for the type, which will be used if the value is not provided
  default(value: any): this {
    this._default = value
    return this
  }

  /// Props / Metadata for the type, like description or other properties
  props(props: TypeProps) {
    this._props = props
    return this
  }

  /// Sets the `desc` property for the type, which is a human-readable description
  describe(msg: string): this {
    if (!this._props)
      this._props = {}
    this._props.desc = msg
    return this
  }

  /// Extends the type with an object, merging the properties
  extend: <O>(obj: O) => Type<T & TypeObject<O>> = (obj: any) => {
    const newObj = { ...this._object, ...obj }
    return object(newObj) as any
  }

  // array(): Type<T[]> {
  //   return new Type<T[]>('array', {
  //     _check: isArray,
  //     _type: this,
  //   })
  // }
}

export type Infer<T> = T extends Type<infer TT> ? TT : never

// Primitives

export function string(): Type<string> {
  return new Type('string', {
    _check: isString,
  })
}

export function number(): Type<number> {
  return new Type('number', {
    _check: isNumber,
  })
}

export function int(): Type<number> {
  return new Type('int', {
    _check: isInteger,
  })
}

export function boolean(): Type<boolean> {
  return new Type('boolean', {
    _check: isBoolean,
  })
}

// Like undefined | null in TS and nil in Swift
export function none(): Type<undefined> {
  return new Type('none', {
    _check: v => v == null,
    _optional: true,
  })
}

export function any<T = any>(): Type<T> {
  return new Type('any', {
    _check: v => v != null,
  })
}

export const float = number
export const double = number
export const real = number

// Object

type TypeObjectFixOptional<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K] & {}
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K] & {}
}

type TypeObjectPretty<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

type TypeObject<T> = TypeObjectPretty<TypeObjectFixOptional<{
  [K in keyof T]: Infer<T[K]>
}>>

/// Object that can have any properties
export function object<T>(tobj: T): Type<TypeObject<T>> {
  return new Type('object', {
    _check: isObject,
    _object: tobj as T,
  })
}

export function record<T extends Type>(tobj: T): Type<Record<string, Infer<T>>> {
  return new Type('object', {
    _check: isObject,
    _object: tobj as T,
  })
}

// Union

type TypeUnion<T extends (Type<any>)[]> = T extends Array<infer U> ? Infer<U> : never

/// Union of types, like `string | number | boolean`
export function union<T extends (Type<any>)[]>(options: T): Type<TypeUnion<T>> {
  return new Type('union', {
    _check: v => options.includes(v),
    _union: options,
  })
}

// Literals

type TypeLiterals = string | number | bigint | boolean

export function literal<T extends TypeLiterals>(value: T): Type<T> {
  return new Type('literal', {
    _check: v => v === value,
    _default: value,
  })
}

/// String that can only be one of the values, like: `"a" | "b" | "c"``
export function stringLiterals<const T extends readonly string[], O = T[number]>(values: T): Type<O> {
  return new Type('string', {
    _check: v => values.includes(v),
    _enumValues: values,
  })
}

// Collections

type TypeTuple<T extends Type[]> = {
  [K in keyof T]: T[K] extends Type<infer U> ? U : never
}

type TypeArrayOutput<Head extends Type[], Rest extends Type | undefined> = [
  ...TypeTuple<Head>,
  ...(Rest extends Type ? Infer<Rest>[] : []),
]

type TypeArray<
  Head extends Type[] = Type[],
  Rest extends Type | undefined = Type | undefined,
> = Type<TypeArrayOutput<Head, Rest>>

// Like an array but with fixed length and types
export function tuple<T extends [] | [Type, ...Type[]]>(items: T): TypeArray<T, undefined> {
  return new Type('tuple', {
    _check: v => items.every((item, i) => item._check?.(v[i]) ?? false),
  })
}

export function array<T>(itemType: Type<T>): Type<T[]> {
  return new Type('array', {
    _check: isArray,
    _type: itemType,
  })
}

/// Regular function
export function func<
  TypeFuncArgs extends [Type<unknown>, ...Type<any>[]] | [],
  TypeFuncRet = Type,
  T = (...args: TypeTuple<TypeFuncArgs>) => Infer<TypeFuncRet>,
>(args: TypeFuncArgs, ret: TypeFuncRet): Type<T> {
  return new Type('function', {
    _check: isFunction,
    _args: args,
    _ret: ret,
  })
}

/// RPC function that only takes one argument and returns a promise
export function rpc<
  TypeRpcInfo extends Type<unknown> | undefined = undefined,
  TypeRpcRet extends Type<unknown> = Type<void>, // ReturnType<typeof none>,
  T = TypeRpcInfo extends undefined ? () => Infer<TypeRpcRet> : (info: Infer<TypeRpcInfo>) => Infer<TypeRpcRet> | Promise<Infer<TypeRpcRet>>,
>(info?: TypeRpcInfo, ret?: TypeRpcRet): Type<T> {
  return new Type('rpc', {
    _check: isFunction,
    _info: info,
    _ret: ret ?? none(),
  })
}
