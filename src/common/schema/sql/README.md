# SQL Select Builder

A minimal, type-safe SQL `SELECT` builder built on top of zeed's `z` schema system. Inspired by Drizzle ORM and Kysely, but deliberately small: single-table queries, no joins, no inserts/updates/deletes.

The goal is to get full TypeScript inference, editor autocompletion, and - uniquely - per-query dependency tracking for reactive use cases.

## Features

- Type-safe table definitions backed by `z` schemas
- Full row type inference for results, including narrowed `pick`/`select` forms
- Editor autocompletion on column keys
- Parameterized SQL output (`?` placeholders, values returned separately)
- Per-query dependency tracking split by role: `select`, `where`, `orderBy`
- Zero runtime dependencies, tree-shakable

## Quick Start

```ts
import { and, boolean, eq, from, gt, inArray, int, like, or, string, table } from 'zeed'

const users = table('users', {
  id: int(),
  name: string(),
  email: string(),
  age: int(),
  active: boolean(),
})

const query = from(users)
  .pick('id', 'name')
  .where(and(eq(users.active, true), gt(users.age, 18)))
  .orderBy(users.name)
  .limit(20)

const { sql, params } = query.toSQL()
// sql:    SELECT "users"."id", "users"."name" FROM "users"
//         WHERE ("users"."active" = ?) AND ("users"."age" > ?)
//         ORDER BY "users"."name" ASC LIMIT ?
// params: [true, 18, 20]
```

## Defining Tables

A table pairs a name with a `z`-schema shape. Each column becomes a typed reference usable in expressions.

```ts
const posts = table('posts', {
  id: int(),
  title: string(),
  body: string(),
  authorId: int(),
  published: boolean(),
})

posts.id // Column<number>
posts.title // Column<string>
```

The shape is a plain `Record<string, Type>`, so any `z` type works (`string`, `int`, `boolean`, `stringLiterals`, ...).

## Selecting Columns

Three forms, depending on how much control you need.

### 1. Full row (default)

```ts
from(users)
// Row: { id: number, name: string, email: string, age: number, active: boolean }
```

### 2. `pick(...keys)` - compact and typed

```ts
from(users).pick('id', 'email')
// Row: { id: number, email: string }
```

Keys are typed against the table shape, so the editor autocompletes valid column names and rejects unknown ones at compile time.

### 3. `select({ alias: column })` - for aliases or mixed expressions

```ts
import { select } from 'zeed'

select({ uid: users.id, n: users.name }).from(users)
// Row: { uid: number, n: string }
// SQL: SELECT "users"."id" AS "uid", "users"."name" AS "n" FROM "users"
```

## Where Clauses

Expressions are built from operator helpers. Columns and literal values can be mixed freely - literals are automatically bound as parameters.

```ts
import { and, eq, gt, gte, inArray, like, lt, ne, or, sqlIsNotNull, sqlIsNull } from 'zeed'

from(users).where(
  and(
    eq(users.active, true),
    or(
      like(users.name, 'A%'),
      inArray(users.id, [1, 2, 3]),
    ),
    sqlIsNotNull(users.email),
  ),
)
```

Available operators:

| Helper          | SQL          |
| --------------- | ------------ |
| `eq(a, b)`      | `a = b`      |
| `ne(a, b)`      | `a <> b`     |
| `gt(a, b)`      | `a > b`      |
| `gte(a, b)`     | `a >= b`     |
| `lt(a, b)`      | `a < b`      |
| `lte(a, b)`     | `a <= b`     |
| `like(a, b)`    | `a LIKE b`   |
| `inArray(a, [])`| `a IN (...)` |
| `sqlIsNull(a)`  | `a IS NULL`  |
| `sqlIsNotNull(a)` | `a IS NOT NULL` |
| `and(...)`      | `(..) AND (..)` |
| `or(...)`       | `(..) OR (..)`  |
| `not(e)`        | `NOT (..)`   |

`and` and `or` accept `undefined`, `false`, and `null` entries and drop them, which is handy for conditional filters.

Note: `sqlIsNull` and `sqlIsNotNull` are prefixed to avoid collision with zeed's existing `isNull`/`isNotNull` data helpers.

## Ordering, Limit, Offset

```ts
from(users)
  .orderBy(users.age, 'DESC')
  .orderBy(users.name) // ASC by default
  .limit(10)
  .offset(20)
```

## Compiling a Query

```ts
const { sql, params, dependencies } = query.toSQL()
```

- `sql` - the query string with `?` placeholders
- `params` - array of bound values in order
- `dependencies` - see below

Pass `sql` and `params` to whichever SQLite/Postgres/MySQL driver you use.

## Dependency Tracking

Every compiled query reports exactly which table columns it touches, split by role. This is the key building block for reactive queries: when the database changes, you can decide whether a given query needs to re-run based on which columns were affected.

```ts
const q = from(users)
  .pick('id', 'name')
  .where(eq(users.email, 'a@b.c'))
  .orderBy(users.age, 'DESC')

q.toSQL().dependencies
// [
//   {
//     table: 'users',
//     select:  ['id', 'name'],  // fields returned to the caller
//     where:   ['email'],       // fields used in filters
//     orderBy: ['age'],         // fields used for ordering
//     all:     ['age', 'email', 'id', 'name'], // union of the above
//   }
// ]
```

### Example: reactive invalidation

```ts
function isAffected(
  deps: readonly QueryDependencies[],
  change: { table: string, columns: string[] },
): boolean {
  return deps.some(d =>
    d.table === change.table
    && d.all.some(c => change.columns.includes(c)),
  )
}

// On a write notification from the database:
if (isAffected(query.toSQL().dependencies, { table: 'users', columns: ['email'] })) {
  // re-run the query, push new rows to subscribers
}
```

Splitting by role lets you optimize further:

- A change to a `select` column means the result *shape* changes - re-render.
- A change to a `where` or `orderBy` column means the result *set* may change - re-query.
- A change to a column not in `all` is irrelevant - skip.

## Type Inference

Row types flow through the builder. Use `InferRow` to extract the result type for downstream code:

```ts
import type { InferRow } from 'zeed'

const query = from(users).pick('id', 'email')
type Row = InferRow<typeof query> // { id: number, email: string }

function render(rows: Row[]) { /* ... */ }
render(await run(query))
```

## Scope and Limitations

By design, this builder is minimal:

- `SELECT` only. No `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`.
- Single table per query. No `JOIN`, no subqueries, no CTEs.
- No aggregate functions (`COUNT`, `SUM`, `GROUP BY`, `HAVING`).
- One SQL dialect (`?` placeholders, double-quoted identifiers). Works with SQLite and, with most drivers, Postgres.

The existing `select({...}).from(...)` form remains available for cases that need column aliases. If you need joins or mutations, use a dedicated ORM - this module is intended for read-only queries in reactive contexts where dependency tracking is the main value-add.

## API Reference

### `table(name, shape)`

Creates a table handle. `shape` is a `Record<string, Type>` from `z`. Returns an object where each key is a typed `Column` plus `_name` and `_shape` metadata.

### `from(table)`

Starts a query. Returns a `SelectBuilder` with the full row type as its default result.

### `select(selection?)`

Alternative entry point. With no argument, behaves like a full-row select (requires a subsequent `.from(...)`). With a `{ alias: column }` map, creates an aliased selection.

### `SelectBuilder`

Chainable methods:

- `.from(table)` - set the source table (only needed after `select()`)
- `.pick(...keys)` - narrow to specific columns by name
- `.where(expr)` - set the WHERE clause
- `.orderBy(column, 'ASC' | 'DESC')` - append an ORDER BY entry
- `.limit(n)` / `.offset(n)`
- `.toSQL()` - compile to `{ sql, params, dependencies }`
- `.dependencies()` - shortcut that returns just the dependencies

### `InferRow<Query>`

Type helper that extracts the row type from a builder or compiled query.
