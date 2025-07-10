// With many, many inspiration from https://github.com/badrap/valita MIT License as of 2024-09-10

import { isArray, isBoolean, isFunction, isInteger, isNumber, isObject, isString } from '../data/is'

/**
 * Metadata interface for type descriptions and additional properties
 */
export interface TypeMeta {
  desc?: string
}

/**
 * Core Type class for schema validation and type inference
 */
export class Type<T = unknown> {
  static displayName = 'Type'

  readonly type: string

  _default?: any
  _optional?: boolean
  _meta?: TypeMeta
  _check?: (obj: any) => boolean
  _object?: any
  _type?: any
  _union?: any
  _enumValues?: any
  _args?: any
  _ret?: any
  _info?: any

  // [key: `_${string}`]: any // Allow only optional dynamic properties starting with an underscore

  constructor(name: string, options: Partial<Type<T>> = {}) {
    this.type = name
    Object.assign(this, options)
  }

  /**
   * Creates a copy of the type with new properties merged
   */
  private _cloneWithProps<U = T>(newProps: Partial<Type<any>> = {}): Type<U> {
    const cloned = new Type<U>(this.type)
    // Copy all existing properties
    const propertiesToCopy = ['_default', '_optional', '_meta', '_check', '_object', '_type', '_union', '_enumValues', '_args', '_ret', '_info']
    for (const prop of propertiesToCopy) {
      if ((this as any)[prop] !== undefined) {
        (cloned as any)[prop] = (this as any)[prop]
      }
    }
    // Apply new properties
    Object.assign(cloned, newProps)
    return cloned
  }

  /**
   * Helper to copy type properties when creating new type instances
   */
  private static _copyTypeProperties(source: Type<any>, target: Type<any>): void {
    const properties = ['_check', '_default', '_meta', '_object', '_type', '_enumValues']
    for (const prop of properties) {
      if ((source as any)[prop] !== undefined) {
        (target as any)[prop] = (source as any)[prop]
      }
    }
  }

  /**
   * Marks the type as optional, meaning it can be undefined
   * This is useful for properties that are not required.
   */
  optional(): Type<T | undefined> {
    return this._cloneWithProps<T | undefined>({ _optional: true })
  }

  /**
   * Sets a default value for the type, which will be used if the value is not provided
   * The default value can be a function that receives the schema as argument, or a static value.
   */
  default(value: T | ((schema?: this) => T)): this {
    this._default = value
    return this
  }

  /**
   * Props / Metadata for the type, like description or other properties
   */
  meta(meta: TypeMeta): this {
    this._meta = meta
    return this
  }

  /**
   * Sets the `desc` property for the type, which is a human-readable description
   */
  describe(msg: string): this {
    if (!this._meta) {
      this._meta = {}
    }
    this._meta.desc = msg
    return this
  }

  /**
   * Extends the type with an object, merging the properties
   */
  extend<O>(obj: O): Type<T & TypeObject<O>> {
    if (!this._object) {
      throw new Error('extend() can only be used on object schemas')
    }
    const newObj = { ...this._object, ...obj }
    return object(newObj) as any
  }

  /**
   * Picks certain keys from an object schema
   */
  pick<K extends keyof T>(keys: Record<K, true>): Type<Pick<T, K>> {
    if (!this._object) {
      throw new Error('pick() can only be used on object schemas')
    }
    const pickedObj: any = {}
    for (const key of Object.keys(keys)) {
      if (key in this._object) {
        pickedObj[key] = (this._object as any)[key]
      }
    }
    return object(pickedObj) as any
  }

  /**
   * Omits certain keys from an object schema
   */
  omit<K extends keyof T>(keys: Record<K, true>): Type<Omit<T, K>> {
    if (!this._object) {
      throw new Error('omit() can only be used on object schemas')
    }
    const omittedObj: any = { ...this._object }
    for (const key of Object.keys(keys)) {
      delete omittedObj[key]
    }
    return object(omittedObj) as any
  }

  /**
   * Helper method to modify object properties with a transformation function
   */
  private _transformObjectProperties(
    transform: (key: string, type: Type<any>, shouldTransform: boolean) => Type<any>,
    keys?: Record<string, true>,
  ): any {
    if (!this._object) {
      throw new Error('This operation can only be used on object schemas')
    }

    const transformedObj: any = {}
    const originalObj = this._object as any

    for (const [key, typeInstance] of Object.entries(originalObj)) {
      const shouldTransform = !keys || key in keys
      transformedObj[key] = transform(key, typeInstance as Type<any>, shouldTransform)
    }

    return object(transformedObj)
  }

  /**
   * Makes some or all properties of an object schema optional
   */
  partial(): Type<Partial<T>>
  partial<K extends keyof T>(keys: Record<K, true>): Type<Partial<Pick<T, K>> & Omit<T, K>>
  partial<K extends keyof T>(keys?: Record<K, true>): Type<Partial<T> | (Partial<Pick<T, K>> & Omit<T, K>)> {
    if (!this._object) {
      throw new Error('partial() can only be used on object schemas')
    }
    return this._transformObjectProperties((key, type, shouldTransform) => {
      if (!shouldTransform)
        return type
      return Type._cloneTypeWithOptional(type, true)
    }, keys)
  }

  /**
   * Makes some or all properties of an object schema required
   */
  required(): Type<Required<T>>
  required<K extends keyof T>(keys: Record<K, true>): Type<Required<Pick<T, K>> & Omit<T, K>>
  required<K extends keyof T>(keys?: Record<K, true>): Type<Required<T> | (Required<Pick<T, K>> & Omit<T, K>)> {
    if (!this._object) {
      throw new Error('required() can only be used on object schemas')
    }
    return this._transformObjectProperties((key, type, shouldTransform) => {
      if (!shouldTransform)
        return type
      return Type._cloneTypeWithOptional(type, false)
    }, keys)
  }

  /**
   * Helper method to clone a type with optional flag
   */
  private static _cloneTypeWithOptional(originalType: Type<any>, optional: boolean): Type<any> {
    const newType = new Type(originalType.type)
    Type._copyTypeProperties(originalType, newType)
    newType._optional = optional
    return newType
  }
}

/**
 * Type inference utility for extracting the TypeScript type from a schema Type
 */
export type Infer<T> = T extends Type<infer TT> ? TT : never

// =============================================================================
// Primitive Types
// =============================================================================

/**
 * Creates a string type validator
 */
export function string(): Type<string> {
  return new Type('string', {
    _check: isString,
  })
}

/**
 * Creates a number type validator
 */
export function number(): Type<number> {
  return new Type('number', {
    _check: isNumber,
  })
}

/**
 * Creates an integer type validator
 */
export function int(): Type<number> {
  return new Type('int', {
    _check: isInteger,
  })
}

/**
 * Creates a boolean type validator
 */
export function boolean(): Type<boolean> {
  return new Type('boolean', {
    _check: isBoolean,
  })
}

/**
 * Creates a none type validator (undefined | null)
 * Like undefined | null in TS and nil in Swift
 */
export function none(): Type<undefined> {
  return new Type('none', {
    _check: (v: any) => v == null,
    _optional: true,
  })
}

/**
 * Creates an any type validator that accepts any non-null value
 */
export function any<T = any>(): Type<T> {
  return new Type('any', {
    _check: (v: any) => v != null,
  })
}

// Aliases for number types
export const float = number
export const double = number
export const real = number

// =============================================================================
// Object Types
// =============================================================================

/**
 * Utility type to make object properties optional if their value type includes undefined.
 * @category Schema
 */
export type TypeObjectFixOptional<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K] & {}
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K] & {}
}

/**
 * Utility type for pretty-printing object types
 */
type TypeObjectPretty<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

/**
 * Main object type utility
 */
type TypeObject<T> = TypeObjectPretty<TypeObjectFixOptional<{
  [K in keyof T]: Infer<T[K]>
}>>

/**
 * Creates an object type validator with specified properties
 */
export function object<T>(tobj: T): Type<TypeObject<T>> {
  return new Type('object', {
    _check: isObject,
    _object: tobj,
  })
}

/**
 * Creates a record type validator (object with string keys and uniform value type)
 */
export function record<T extends Type>(valueType: T): Type<Record<string, Infer<T>>> {
  return new Type('record', {
    _check: isObject,
    _type: valueType,
  })
}

// =============================================================================
// Union Types
// =============================================================================

/**
 * Utility type for union of types.
 * @category Schema
 */
export type TypeUnion<T extends Type<any>[]> = T extends Array<infer U> ? Infer<U> : never

/**
 * Creates a union type validator (like `string | number | boolean`)
 */
export function union<T extends Type<any>[]>(options: T): Type<TypeUnion<T>> {
  return new Type('union', {
    _check: (v: any) => options.some(option => option._check?.(v) ?? false),
    _union: options,
  })
}

// =============================================================================
// Literal Types
// =============================================================================

/**
 * Utility type for literal types.
 * @category Schema
 */
export type TypeLiterals = string | number | bigint | boolean

/**
 * Creates a literal value validator
 */
export function literal<T extends TypeLiterals>(value: T): Type<T> {
  return new Type('literal', {
    _check: (v: any) => v === value,
    _default: value,
  })
}

/**
 * Creates a string literal union validator (like `"a" | "b" | "c"`)
 */
export function stringLiterals<const T extends readonly string[], O = T[number]>(values: T): Type<O> {
  return new Type('string', {
    _check: (v: any) => typeof v === 'string' && values.includes(v),
    _enumValues: values,
  })
}

// =============================================================================
// Collection Types
// =============================================================================

/**
 * Utility type for tuple types.
 * @category Schema
 */
export type TypeTuple<T extends Type[]> = {
  [K in keyof T]: T[K] extends Type<infer U> ? U : never
}

/**
 * Output type for TypeArray.
 * @category Schema
 */
export type TypeArrayOutput<Head extends Type[], Rest extends Type | undefined> = [
  ...TypeTuple<Head>,
  ...(Rest extends Type ? Infer<Rest>[] : []),
]

/**
 * Utility type for array types.
 * @category Schema
 */
export type TypeArray<Head extends Type[] = Type[], Rest extends Type | undefined = Type | undefined> = Type<TypeArrayOutput<Head, Rest>>

/**
 * Creates a tuple type validator with fixed length and types
 */
export function tuple<T extends [] | [Type, ...Type[]]>(items: T): TypeArray<T, undefined> {
  return new Type('tuple', {
    _check: (v: any) => Array.isArray(v) && v.length === items.length && items.every((item, i) => item._check?.(v[i]) ?? false),
    _type: items,
  })
}

/**
 * Creates an array type validator for a specific item type
 */
export function array<T>(itemType: Type<T>): Type<T[]> {
  return new Type('array', {
    _check: isArray,
    _type: itemType,
  })
}

// =============================================================================
// Function Types
// =============================================================================

/**
 * Creates a regular function type validator
 */
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

/**
 * Creates an RPC function type validator that takes one argument and returns a promise
 */
export function rpc<
  TypeRpcInfo extends Type<unknown> | undefined = undefined,
  TypeRpcRet extends Type<unknown> = Type<void>,
  T = TypeRpcInfo extends undefined
    ? () => Infer<TypeRpcRet>
    : (info: Infer<TypeRpcInfo>) => Infer<TypeRpcRet> | Promise<Infer<TypeRpcRet>>,
>(info?: TypeRpcInfo, ret?: TypeRpcRet): Type<T> {
  return new Type('rpc', {
    _check: isFunction,
    _info: info,
    _ret: ret ?? none(),
  })
}
