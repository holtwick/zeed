import type { Infer } from '../schema'
import type { Expr } from './expr'
import type { Column, TableColumns, TableShape } from './table'

export type RowFromTable<T> = T extends TableColumns<any, infer S>
  ? { [K in keyof S]: Infer<S[K]> }
  : never

export type RowFromSelection<S> = {
  [K in keyof S]: S[K] extends Column<infer T> ? T : never
}

export interface QueryDependencies {
  readonly table: string
  readonly select: readonly string[]
  readonly where: readonly string[]
  readonly orderBy: readonly string[]
  readonly all: readonly string[]
}

export interface CompiledQuery<Row> {
  readonly sql: string
  readonly params: readonly unknown[]
  readonly dependencies: readonly QueryDependencies[]
  readonly __row?: Row
}

interface OrderByEntry {
  col: Column
  dir: 'ASC' | 'DESC'
}

interface SelectState {
  selection?: Record<string, Column>
  from?: TableColumns<any, any>
  where?: Expr
  orderBy: OrderByEntry[]
  limit?: number
  offset?: number
}

export class SelectBuilder<Row> {
  private _state: SelectState

  constructor(state: SelectState) {
    this._state = state
  }

  from<N extends string, S extends TableShape>(
    t: TableColumns<N, S>,
  ): SelectBuilder<Row extends void ? { [K in keyof S]: Infer<S[K]> } : Row> {
    this._state.from = t
    return this as any
  }

  where(expr: Expr): this {
    this._state.where = expr
    return this
  }

  orderBy(col: Column, dir: 'ASC' | 'DESC' = 'ASC'): this {
    this._state.orderBy.push({ col, dir })
    return this
  }

  limit(n: number): this {
    this._state.limit = n
    return this
  }

  offset(n: number): this {
    this._state.offset = n
    return this
  }

  toSQL(): CompiledQuery<Row> {
    const s = this._state
    if (!s.from)
      throw new Error('select: from() is required')

    const tableName = s.from._name
    const params: unknown[] = []
    const selectRefs: Column[] = []
    const whereRefs: Column[] = []
    const orderByRefs: Column[] = []

    let cols: string
    if (s.selection) {
      const parts: string[] = []
      for (const [alias, col] of Object.entries(s.selection)) {
        selectRefs.push(col)
        const ident = `"${col._table}"."${col._name}"`
        parts.push(alias === col._name ? ident : `${ident} AS "${alias}"`)
      }
      cols = parts.join(', ')
    }
    else {
      const shape = s.from._shape
      const names = Object.keys(shape)
      for (const n of names) selectRefs.push((s.from as any)[n])
      cols = names.map(n => `"${tableName}"."${n}"`).join(', ')
    }

    let sql = `SELECT ${cols} FROM "${tableName}"`

    if (s.where) {
      sql += ` WHERE ${s.where.sql}`
      params.push(...s.where.params)
      whereRefs.push(...s.where.refs)
    }

    if (s.orderBy.length) {
      const parts = s.orderBy.map((o) => {
        orderByRefs.push(o.col)
        return `"${o.col._table}"."${o.col._name}" ${o.dir}`
      })
      sql += ` ORDER BY ${parts.join(', ')}`
    }

    if (s.limit != null) {
      sql += ` LIMIT ?`
      params.push(s.limit)
    }

    if (s.offset != null) {
      sql += ` OFFSET ?`
      params.push(s.offset)
    }

    return {
      sql,
      params,
      dependencies: collectDependencies(selectRefs, whereRefs, orderByRefs),
      __row: undefined as any,
    }
  }

  dependencies(): readonly QueryDependencies[] {
    return this.toSQL().dependencies
  }
}

function collectDependencies(
  selectRefs: Column[],
  whereRefs: Column[],
  orderByRefs: Column[],
): QueryDependencies[] {
  interface Buckets {
    select: Set<string>
    where: Set<string>
    orderBy: Set<string>
  }
  const map = new Map<string, Buckets>()
  const bucket = (table: string): Buckets => {
    let b = map.get(table)
    if (!b) {
      b = { select: new Set(), where: new Set(), orderBy: new Set() }
      map.set(table, b)
    }
    return b
  }
  for (const c of selectRefs) bucket(c._table).select.add(c._name)
  for (const c of whereRefs) bucket(c._table).where.add(c._name)
  for (const c of orderByRefs) bucket(c._table).orderBy.add(c._name)

  return Array.from(map, ([table, b]) => {
    const all = new Set<string>([...b.select, ...b.where, ...b.orderBy])
    return {
      table,
      select: Array.from(b.select).sort(),
      where: Array.from(b.where).sort(),
      orderBy: Array.from(b.orderBy).sort(),
      all: Array.from(all).sort(),
    }
  })
}

export function select(): SelectBuilder<void>
export function select<S extends Record<string, Column<any>>>(
  selection: S,
): SelectBuilder<RowFromSelection<S>>
export function select(selection?: Record<string, Column>): SelectBuilder<any> {
  return new SelectBuilder({ selection, orderBy: [] })
}

export type InferRow<Q> = Q extends SelectBuilder<infer R>
  ? R
  : Q extends CompiledQuery<infer R> ? R : never
