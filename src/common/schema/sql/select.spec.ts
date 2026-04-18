import type { Expect, IsEqual } from '../type-test'
import type { InferRow } from './select'
import { boolean, int, string } from '../schema'
import { and, eq, gt, inArray, like, or } from './expr'
import { from, select } from './select'
import { table } from './table'

const users = table('users', {
  id: int(),
  name: string(),
  email: string(),
  age: int(),
  active: boolean(),
})

describe('sql select', () => {
  it('selects all columns of a table', () => {
    const q = select().from(users).toSQL()
    expect(q.sql).toBe(
      'SELECT "users"."id", "users"."name", "users"."email", "users"."age", "users"."active" FROM "users"',
    )
    expect(q.params).toEqual([])
    expect(q.dependencies).toEqual([
      {
        table: 'users',
        select: ['active', 'age', 'email', 'id', 'name'],
        where: [],
        orderBy: [],
        all: ['active', 'age', 'email', 'id', 'name'],
      },
    ])
  })

  it('selects specific columns with type inference', () => {
    const q = select({ id: users.id, name: users.name }).from(users)
    type Row = InferRow<typeof q>
    type _T = Expect<IsEqual<Row, { id: number, name: string }>>

    const c = q.toSQL()
    expect(c.sql).toBe('SELECT "users"."id", "users"."name" FROM "users"')
    expect(c.dependencies).toEqual([
      {
        table: 'users',
        select: ['id', 'name'],
        where: [],
        orderBy: [],
        all: ['id', 'name'],
      },
    ])
  })

  it('from() + pick() is a compact form with typed keys', () => {
    const q = from(users).pick('id', 'name').where(eq(users.email, 'x'))
    type Row = InferRow<typeof q>
    type _T = Expect<IsEqual<Row, { id: number, name: string }>>

    const c = q.toSQL()
    expect(c.sql).toBe(
      'SELECT "users"."id", "users"."name" FROM "users" WHERE "users"."email" = ?',
    )
    expect(c.params).toEqual(['x'])
    expect(c.dependencies[0].select).toEqual(['id', 'name'])
    expect(c.dependencies[0].where).toEqual(['email'])
  })

  it('from() without pick returns the full row', () => {
    const q = from(users)
    type Row = InferRow<typeof q>
    type _T = Expect<IsEqual<Row, {
      id: number
      name: string
      email: string
      age: number
      active: boolean
    }>>
    expect(q.toSQL().sql).toBe(
      'SELECT "users"."id", "users"."name", "users"."email", "users"."age", "users"."active" FROM "users"',
    )
  })

  it('supports aliases in selection', () => {
    const q = select({ uid: users.id }).from(users).toSQL()
    expect(q.sql).toBe('SELECT "users"."id" AS "uid" FROM "users"')
  })

  it('builds where with parameters', () => {
    const q = select()
      .from(users)
      .where(and(eq(users.active, true), gt(users.age, 18)))
      .toSQL()
    expect(q.sql).toContain('WHERE ("users"."active" = ?) AND ("users"."age" > ?)')
    expect(q.params).toEqual([true, 18])
  })

  it('separates select, where and orderBy dependencies', () => {
    const q = select({ id: users.id })
      .from(users)
      .where(eq(users.email, 'a@b.c'))
      .orderBy(users.age, 'DESC')
      .toSQL()
    const dep = q.dependencies[0]
    expect(dep.table).toBe('users')
    expect(dep.select).toEqual(['id'])
    expect(dep.where).toEqual(['email'])
    expect(dep.orderBy).toEqual(['age'])
    expect(dep.all).toEqual(['age', 'email', 'id'])
  })

  it('supports or, like, inArray', () => {
    const q = select()
      .from(users)
      .where(or(like(users.name, 'A%'), inArray(users.id, [1, 2, 3])))
      .toSQL()
    expect(q.sql).toContain('WHERE ("users"."name" LIKE ?) OR ("users"."id" IN (?, ?, ?))')
    expect(q.params).toEqual(['A%', 1, 2, 3])
  })

  it('handles orderBy, limit, offset and tracks orderBy deps', () => {
    const q = select({ id: users.id })
      .from(users)
      .orderBy(users.age, 'DESC')
      .limit(10)
      .offset(20)
      .toSQL()
    expect(q.sql).toBe(
      'SELECT "users"."id" FROM "users" ORDER BY "users"."age" DESC LIMIT ? OFFSET ?',
    )
    expect(q.params).toEqual([10, 20])
    expect(q.dependencies[0].select).toEqual(['id'])
    expect(q.dependencies[0].orderBy).toEqual(['age'])
    expect(q.dependencies[0].all).toEqual(['age', 'id'])
  })

  it('dependencies() invalidation check helper', () => {
    const q = select({ id: users.id }).from(users).where(eq(users.email, 'x'))
    const deps = q.dependencies()
    const changedTable = 'users'
    const changedColumns = ['email']
    const affected = deps.some(d =>
      d.table === changedTable && d.all.some(c => changedColumns.includes(c)),
    )
    expect(affected).toBe(true)
  })
})
