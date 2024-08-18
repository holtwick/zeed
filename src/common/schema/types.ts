// Schema implementation inspired by https://github.com/badrap/valita and those similar to zod

export interface TypeProps {
}

export interface Type<T = unknown> {
  type: string

  _optional?: boolean
  _default?: T | (() => T)
  _object?: ObjectInput
  _union?: Type[]

  _check: (obj: any) => boolean

  optional: () => Type<T | undefined>
  default: (value: T | (() => T)) => Type<T | undefined>

  parse: (obj: any, opt?: { // todo obj: T ?
    transform?: boolean
    strict?: boolean
  }) => T

  _props?: TypeProps
  props: (props: TypeProps) => Type<T>
}

export type Infer<T> = T extends Type<infer TT> ? TT : never

export type ObjectInput = Record<string, Type<any>>

type ObjectFixOptional<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K] & {}
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K] & {}
}

type ObjectPretty<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

export type ObjectOutput<T extends ObjectInput> = Type<ObjectPretty<ObjectFixOptional<{
  [K in keyof T]: Infer<T[K]>
}>>>
