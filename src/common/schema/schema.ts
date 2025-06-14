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
  // _object?: T
  _check?: (obj: any) => boolean

  [key: string]: any // Allow dynamic properties

  constructor(name: string, options: Record<string, any>) {
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
  extend: <O>(obj: O) => Type<T & InferObject<O>> = (obj: any) => {
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

// Helper

function generic<T = unknown>(type: string, opt?: Partial<Type<T>>): Type<T> {
  return new Type<T>(type, opt as any)
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

export function int() {
  return generic<number>('int', {
    _check: isInteger,
  })
}

export function boolean() {
  return generic<boolean>('boolean', {
    _check: isBoolean,
  })
}

// Like undefined | null in TS and nil in Swift
export function none() {
  return generic<undefined>('none', {
    _check: v => v == null,
    _optional: true,
  })
}

export function any<T = any>() {
  return generic<T>('any', {
    _check: v => v != null,
  })
}

export const float = number
export const double = number
export const real = number

// Object

type ObjectFixOptional<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K] & {}
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K] & {}
}

type ObjectPretty<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

export type InferObject<T> = ObjectPretty<ObjectFixOptional<{
  [K in keyof T]: Infer<T[K]>
}>>

/// Object that can have any properties
export function object<T>(tobj: T): Type<InferObject<T>> {
  return generic<InferObject<T>>('object', {
    _check: isObject,
    _object: tobj as T,
  })
}

export function record<T extends Type>(tobj: T): Type<Record<string, Infer<T>>> {
  return generic<InferObject<T>>('object', {
    _check: isObject,
    _object: tobj as T,
  })
}

// Union

type TransformToUnion<T extends (Type<any>)[]> = T extends Array<infer U> ? Infer<U> : never

/// Union of types, like `string | number | boolean`
export function union<T extends (Type<any>)[]>(options: T): Type<TransformToUnion<T>> {
  return generic<TransformToUnion<T>>('union', {
    _check: v => options.includes(v),
    _union: options,
  })
}

// Literals

type Literal = string | number | bigint | boolean

/// todo: string?
export function literal<T extends Literal>(value: T): Type<T> {
  return generic<T>('literal', {
    _check: v => v === value,
    _default: value,
  })
}

/// String that can only be one of the values, like: `"a" | "b" | "c"``
export function stringLiterals<const T extends readonly string[], O = T[number]>(values: T): Type<O> {
  return generic<O>('string', {
    _check: v => values.includes(v),
    _enumValues: values,
  })
}

// Collections

type TupleOutput<T extends Type[]> = {
  [K in keyof T]: T[K] extends Type<infer U> ? U : never
}

type ArrayOutput<Head extends Type[], Rest extends Type | undefined> = [
  ...TupleOutput<Head>,
  ...(Rest extends Type ? Infer<Rest>[] : []),
]

type ArrayType<
  Head extends Type[] = Type[],
  Rest extends Type | undefined = Type | undefined,
> = Type<ArrayOutput<Head, Rest>>

// Like an array but with fixed length and types
export function tuple<T extends [] | [Type, ...Type[]]>(items: T): ArrayType<T, undefined> {
  return generic('tuple', {
    _check: v => items.every((item, i) => item._check?.(v[i]) ?? false),
  })
}

export function array<T>(itemType: Type<T>): Type<T[]> {
  return generic<T[]>('array', {
    _check: isArray,
    _type: itemType,
  })
}

/// Regular function
export function func<
  Args extends [Type<unknown>, ...Type<any>[]] | [],
  Ret = Type,
  T = (...args: TupleOutput<Args>) => Infer<Ret>,
>(args: Args, ret: Ret): Type<T> {
  return generic<T>('function', {
    _check: isFunction,
    _args: args,
    _ret: ret,
  })
}

/// RPC function that only takes one argument and returns a promise
export function rpc<
  Info extends Type<unknown> | undefined = undefined,
  Ret extends Type<unknown> = Type<void>, // ReturnType<typeof none>,
  T = Info extends undefined ? () => Infer<Ret> : (info: Infer<Info>) => Infer<Ret> | Promise<Infer<Ret>>,
>(info?: Info, ret?: Ret) {
  return generic<T>('rpc', {
    _check: isFunction,
    _info: info,
    _ret: ret ?? none(),
  })
}

/// Reduce conflicts with real type names, use like z.string()
export const z = {
  string,
  number,
  int,
  boolean,
  none,
  any,
  enum: stringLiterals,
  object,
  array,
  tuple,
  union,
  func,
  rpc,
  literal,
  stringLiterals,
  float,
  double,
  real,
  record,
}
