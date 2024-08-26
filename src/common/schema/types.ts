// Schema implementation inspired by https://github.com/badrap/valita and those similar to zod

export interface TypeProps {
}

export type TypeNames = 'string' | 'number' | 'boolean' | 'object' | 'any' | string // | 'null' | 'undefined' | 'symbol' | 'bigint'

export interface Type<T = unknown> {
  type: TypeNames

  _optional?: boolean
  _default?: T | (() => T)
  _object?: SchemaDefinitionObject<Type<T>>
  _union?: Type[]
  _integer?: boolean

  _check: (obj: any) => boolean

  optional: () => Type<T | undefined>
  default: (value: T | (() => T)) => Type<T | undefined>

  parse: (obj: any, opt?: { // todo obj: T ?
    transform?: boolean
    strict?: boolean
  }) => T

  _props?: TypeProps
  props: (props: TypeProps) => Type<T>

  map: (obj: any, fn: (this: Type<T>, obj: any, schema: Type<T>) => any) => any
}

export type Infer<T> = T extends Type<infer TT> ? TT : never

export type SchemaDefinitionObject<T = any> = Record<string, Type<T>>

type ObjectFixOptional<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K] & {}
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K] & {}
}

type ObjectPretty<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

export type TypeObject<T extends SchemaDefinitionObject> = Type<ObjectPretty<ObjectFixOptional<{
  [K in keyof T]: Infer<T[K]>
}>>>
