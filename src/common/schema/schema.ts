// With many, many inspiration from https://github.com/badrap/valita MIT License as of 2024-09-10

import { isBoolean, isFunction, isInteger, isNumber, isObject, isString } from '../data/is'
import { first } from '../data/utils'

export interface TypeProps {
}

// export interface TypeAssert {
//   fn: (obj: any) => boolean | never
//   message?: string
// }

export interface Type<T = unknown> {
  _default?: T
  _optional?: boolean
  _props?: TypeProps
  _object?: T
  readonly type: string
  readonly _check: (obj: any) => boolean
  optional: () => Type<T | undefined>
  default: (value: any) => Type<T>
  parse: (obj: any) => T
  map: (obj: any, fn: (this: Type<T>, obj: any, schema: Type<T>) => any) => any
  props: (props: TypeProps) => Type<T>
}

export abstract class TypeClass<T = unknown> implements Type<T> {
  readonly type
  readonly _check

  constructor(name: string, check?: (obj: any) => boolean) {
    this.type = name
    this._check = check ?? (() => true)
  }

  _object?: T

  _optional?: boolean

  optional(): TypeClass<T | undefined> { // todo keep the inherited class type
    this._optional = true
    return this
  }

  _default?: T

  default(value: any): TypeClass<T> { // todo keep the inherited class type
    this._default = value
    return this
  }

  parse(obj: any): T {
    if (obj == null) {
      if (this._default != null) {
        if (isFunction(this._default))
          obj = this._default()
        else
          obj = this._default
      }
    }
    if (obj == null && this._optional === true)
      return undefined as any
    if (obj == null)
      throw new Error(`cannot be undefined, is ${obj}`)
    if (!this._check || this._check(obj))
      return obj
    throw new Error('wrong value')
  }

  map(obj: any, fn: (this: Type<T>, obj: any, schema: Type<T>) => any): any {
    return fn.call(this, obj, this) ?? obj
  }

  _props?: TypeProps

  props(props: TypeProps) {
    this._props = props
    return this
  }
}

export type Infer<T> = T extends Type<infer TT> ? TT : never

// Helper

class TypeGeneric<T> extends TypeClass<T> {
}

function generic<T = unknown>(type: string, opt?: Partial<Type<T>>): Type<T> {
  return new TypeGeneric<T>(type, opt?._check)
}

// Primitives

class TypeStringClass<T extends string> extends TypeClass<T> {
  pattern(rx: RegExp) {
    // this.ass
    return this
  }
}

export function string() {
  return new TypeStringClass<string>('string', isString)
}

export function number() {
  return generic<number>('number', {
    _check: isNumber,
  })
}

export const float = number
export const double = number
export const real = number

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

// todo: appears to result in optional inside object
export function any() {
  return generic<any>('any', {
    _check: v => v != null,
    _optional: true,
  })
}

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

// interface TypeObject<T = unknown> extends Type<T> {
//   _object: T
// }

export class TypeObjectClass<T, O = InferObject<T>> extends TypeClass<O> {
  constructor(obj: T) {
    super('object', () => true)
    this._object = obj as any
  }

  parse(obj: any) {
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
  }

  map(obj: any, fn: (this: Type<O>, obj: any, schema: Type<O>) => any): any {
    const result = fn.call(this as any, obj, this as any)
    if (result !== undefined)
      return result
    const newObj: any = {}
    if (obj) {
      for (const [key, info] of Object.entries(this._object ?? {})) {
        const value = (info as Type).map((obj as any)[key], fn as any)
        if (value !== undefined)
          newObj[key] = value
      }
    }
    return newObj
  }
}

export function object<T>(tobj: T): Type<InferObject<T>> {
  return new TypeObjectClass(tobj)
}

// Union

type TransformToUnion<T extends (Type<any>)[]> = T extends Array<infer U> ? Infer<U> : never

export function union<T extends (Type<any>)[]>(options: T): Type<TransformToUnion<T>> {
  return generic<any>(first(options)?.type ?? 'any', {
    // _union: options,
    // _check(obj) {
    //   return this._union?.some(t => t._check(obj)) ?? true
    // },
  })
}

// Literal

type Literal = string | number | bigint | boolean

export function literal<T extends Literal>(value: T): Type<T> {
  return generic<T>('string', {
    _check: v => v === value,
  })
}

export function stringLiterals<const T extends readonly string[], O = T[number]>(value: T): Type<O> {
  return generic<O>('string', {
    _check: v => value.includes(v),
  })
}

// Function

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

export function tuple<T extends [] | [Type, ...Type[]]>(items: T): ArrayType<T, undefined> {
  return generic('tuple', {
    _check: v => items.every((item, i) => item._check(v[i])),
  })
}

export function array<T>(itemType: Type<T>): Type<T[]> {
  return generic<T[]>('array', {
    _check: v => Array.isArray(v) && v.every(item => itemType._check(item)),
  })
}

// const tt = tuple([number(), string(), boolean()])
// type ttt = Infer<typeof tt> // expected [number, string, boolean]

// type Test1 = Expect<IsEqual<ttt, [number, string, boolean]>> // Should pass

class TypeFuncClass<T, Args, Ret> extends TypeClass<T> {
  constructor(
    name: string,
    args: Args,
    ret?: Ret,
  ) {
    super(name, v => isFunction(v))
    this._args = args
    this._ret = ret
  }

  _args?: Args
  _ret?: Ret
}

export function func<
  Args extends [Type<unknown>, ...Type<any>[]] | [],
  Ret = Type,
  T = (...args: TupleOutput<Args>) => Infer<Ret>,
>(args: Args, ret: Ret): Type<T> {
  return new TypeFuncClass<T, Args, Ret>('function', args, ret)
}

class TypeRpcClass<T, Info, Ret> extends TypeClass<T> {
  constructor(
    name: string,
    info?: Info,
    ret?: Ret,
  ) {
    super(name, v => isFunction(v))
    this._info = info
    this._ret = ret
  }

  _info?: Info
  _ret?: Ret
}

export function rpc<
  Info extends Type<unknown> | undefined = undefined,
  Ret extends Type<unknown> = ReturnType<typeof none>,
  T = Info extends undefined ? () => Infer<Ret> : (info: Infer<Info>) => Infer<Ret>,
>(info?: Info, ret?: Ret): Type<T> {
  return new TypeRpcClass<T, Info, Ret>('rpc', info, ret ?? none() as Ret)
}

// const fn = func([string(), boolean(), int()], string()) // typeof fn should be: Type<(...args: [string, boolean]) => string>

// type typeFn = Infer<typeof fn> // typeFn should be: (...args: [string, boolean]) => string

// type f1 = (a: number, b?: string) => boolean
// type xx = Parameters<f1>
