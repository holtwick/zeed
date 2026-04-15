import type { Infer, Type } from '../schema'

export interface Column<T = unknown> {
  readonly _table: string
  readonly _name: string
  readonly _type: Type<T>
  readonly __row?: T
}

export type TableShape = Record<string, Type<any>>

export type TableColumns<N extends string, S extends TableShape> = {
  readonly [K in keyof S & string]: Column<Infer<S[K]>>
} & {
  readonly _name: N
  readonly _shape: S
}

export function table<N extends string, S extends TableShape>(
  name: N,
  shape: S,
): TableColumns<N, S> {
  const out: any = { _name: name, _shape: shape }
  for (const key of Object.keys(shape)) {
    out[key] = {
      _table: name,
      _name: key,
      _type: shape[key],
    }
  }
  return out
}

export function isColumn(v: any): v is Column {
  return !!v && typeof v._table === 'string' && typeof v._name === 'string' && v._type
}
