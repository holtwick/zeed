import { first, isBoolean, isFunction, isInteger, isNumber, isObject, isString } from '../data'

export interface TypeProps {
}

export type TypeNames = string

// export interface TypeAssert {
//   fn: (obj: any) => boolean | never
//   message?: string
// }

export interface Type<T = unknown> {
  type: TypeNames

  // _value?: T
  _object?: Record<string, Type>
  _union?: Type[]

  _check: (obj: any) => boolean

  // _asserts?: TypeAssert[]
  // assert: (fn: (obj:any)=> boolean, message?:string) => Type<T>

  _optional?: boolean
  optional: () => Type<T | undefined>

  // !!! this causes errors !!! No idea why yet!
  // default: (value: T | (() => T)) => Type<T | undefined>

  _default?: T | (() => T)
  default: (value: any) => Type<T | undefined>

  parse: (obj: any, opt?: { // todo obj: T ?
    transform?: boolean
    strict?: boolean
  }) => T

  _props?: TypeProps
  props: (props: TypeProps) => Type<T>

  map: (obj: any, fn: (this: Type<T>, obj: any, schema: Type<T>) => any) => any
}

export type Infer<T> = T extends Type<infer TT> ? TT : never

type ObjectFixOptional<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K] & {}
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K] & {}
}

type ObjectPretty<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

export type TypeObject<T = unknown> = Type<ObjectPretty<ObjectFixOptional<{
  [K in keyof T]: Infer<T[K]>
}>>>

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

function generic<T>(type: TypeNames, opt?: Partial<Type<T>>): Type<T> {
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

export const float = number

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

type TransformToUnion<T extends (Type<any>)[]> = T extends Array<infer U> ? Infer<U> : never

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

export function stringLiterals<const T extends readonly string[], O = T[number]>(value: T): Type<O> {
  return generic<O>('string', {
    _check: v => value.includes(v),
  })
}

// Function

type TupleOutput<T extends Type[]> = {
  [K in keyof T]: T[K] extends Type<infer U> ? U : never;
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

// const tt = tuple([number(), string(), boolean()])
// type ttt = Infer<typeof tt> // expected [number, string, boolean]

// type Test1 = Expect<IsEqual<ttt, [number, string, boolean]>> // Should pass

export function func<
  Args extends [Type<unknown>, ...Type<any>[]] | [],
  Ret = Type,
  T = (...args: TupleOutput<Args>) => Infer<Ret>,
>(args: Args, ret: Ret): Type<T> {
  return generic('function', {
    _check: v => isFunction(v),
  })
}

// const fn = func([string(), boolean(), int()], string()) // typeof fn should be: Type<(...args: [string, boolean]) => string>

// type typeFn = Infer<typeof fn> // typeFn should be: (...args: [string, boolean]) => string

// type f1 = (a: number, b?: string) => boolean
// type xx = Parameters<f1>
