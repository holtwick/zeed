import type { Column } from './table'
import { isColumn } from './table'

export interface Expr {
  readonly kind: 'expr'
  readonly sql: string
  readonly params: unknown[]
  readonly refs: Column[]
}

function operand(v: any): Expr {
  if (isColumn(v)) {
    return {
      kind: 'expr',
      sql: `"${v._table}"."${v._name}"`,
      params: [],
      refs: [v],
    }
  }
  if (v && v.kind === 'expr')
    return v as Expr
  return { kind: 'expr', sql: '?', params: [v], refs: [] }
}

function binop(op: string) {
  return (a: Column | Expr | unknown, b: Column | Expr | unknown): Expr => {
    const x = operand(a)
    const y = operand(b)
    return {
      kind: 'expr',
      sql: `${x.sql} ${op} ${y.sql}`,
      params: [...x.params, ...y.params],
      refs: [...x.refs, ...y.refs],
    }
  }
}

export const eq = binop('=')
export const ne = binop('<>')
export const gt = binop('>')
export const gte = binop('>=')
export const lt = binop('<')
export const lte = binop('<=')
export const like = binop('LIKE')

export function and(...parts: (Expr | undefined | false | null)[]): Expr {
  const list = parts.filter((p): p is Expr => !!p)
  if (list.length === 0)
    return { kind: 'expr', sql: '1=1', params: [], refs: [] }
  if (list.length === 1)
    return list[0]
  return {
    kind: 'expr',
    sql: list.map(p => `(${p.sql})`).join(' AND '),
    params: list.flatMap(p => p.params),
    refs: list.flatMap(p => p.refs),
  }
}

export function or(...parts: (Expr | undefined | false | null)[]): Expr {
  const list = parts.filter((p): p is Expr => !!p)
  if (list.length === 0)
    return { kind: 'expr', sql: '1=0', params: [], refs: [] }
  if (list.length === 1)
    return list[0]
  return {
    kind: 'expr',
    sql: list.map(p => `(${p.sql})`).join(' OR '),
    params: list.flatMap(p => p.params),
    refs: list.flatMap(p => p.refs),
  }
}

export function not(e: Expr): Expr {
  return { kind: 'expr', sql: `NOT (${e.sql})`, params: e.params, refs: e.refs }
}

export function sqlIsNull(col: Column | Expr): Expr {
  const x = operand(col)
  return { kind: 'expr', sql: `${x.sql} IS NULL`, params: x.params, refs: x.refs }
}

export function sqlIsNotNull(col: Column | Expr): Expr {
  const x = operand(col)
  return { kind: 'expr', sql: `${x.sql} IS NOT NULL`, params: x.params, refs: x.refs }
}

export function inArray(col: Column | Expr, values: unknown[]): Expr {
  const x = operand(col)
  if (values.length === 0)
    return { kind: 'expr', sql: '1=0', params: [], refs: x.refs }
  const placeholders = values.map(() => '?').join(', ')
  return {
    kind: 'expr',
    sql: `${x.sql} IN (${placeholders})`,
    params: [...x.params, ...values],
    refs: x.refs,
  }
}
