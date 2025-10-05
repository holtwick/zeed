# Schema Type System

This module provides a flexible, TypeScript-friendly schema/type system for runtime validation, parsing, and type inference. It is inspired by libraries like [valita](https://github.com/badrap/valita).

## Features
- Define schemas for primitives, objects, arrays, tuples, unions, literals, and functions
- Parse and validate data at runtime
- Type inference for static TypeScript types
- Extensible and composable

## Installation

This module is part of the `github-zeed` project. To use it, import from the appropriate path:

```ts
import { array, Infer, literal, number, object, string, union, z } from './schema'
// z.string and string are functionally alike, but z.string is preferred for consistency.
```

## Basic Usage

### Primitives

```ts
const name = z.string()
const age = z.number()
// Type: string, number
```

### Objects

```ts
const user = z.object({
  name: z.string(),
  age: z.number().optional(),
})
// Type: { name: string; age?: number }
```

### Arrays

```ts
const tags = z.array(z.string())
// Type: string[]
```

### Unions

```ts
const status = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
// Type: 'active' | 'inactive'
```

### Type Inference

```ts
type User = Infer<typeof user>
// Equivalent to: { name: string; age?: number }
```

### Parsing

```ts
const parsed = user.parse({ name: 'Alice', age: 30 })
// parsed: { name: 'Alice', age: 30 }
```

### Optional and Default Values

```ts
const score = z.number().optional().default(0)
// Type: number | undefined (default: 0)
```

### Function and RPC Types

```ts
const add = z.func([z.number(), z.number()], z.number())
// Type: (a: number, b: number) => number
const rpcCall = z.rpc(z.object({ id: z.string() }), z.number())
// Type: (info: { id: string }) => number | Promise<number>
```

### Serialization and Deserialization

You can serialize schema definitions to plain JSON objects and deserialize them back. This is useful for sending schema definitions over the network or storing them in databases.

```ts
import { deserializeSchema, serializeSchema } from './schema'

// Define a schema
const userSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
  role: z.stringLiterals(['admin', 'user']).default('user'),
})

// Serialize to plain JSON
const serialized = serializeSchema(userSchema)
// Result: { type: 'object', object: { name: { type: 'string' }, ... } }

// Send over network, store in DB, etc.
const jsonString = JSON.stringify(serialized)

// Deserialize back to a schema
const deserialized = deserializeSchema(JSON.parse(jsonString))
// deserialized is now a Type instance identical to userSchema

// Use the deserialized schema for validation
const user = deserialized.parse({ name: 'Alice', role: 'admin' })
```

**Note**: Function defaults (e.g., `.default(() => 'value')`) cannot be serialized and will be omitted. Only static default values are preserved during serialization.

## API Reference

- `string()`, `number()`, `int()`, `boolean()`, `none()`, `any()`
- `object({...})`, `array(type)`, `tuple([type1, type2, ...])`, `record(type)`
- `union([type1, type2, ...])`
- `literal(value)`, `stringLiterals(['a', 'b', ...])`
- `func(args, ret)`, `rpc(info, ret)`
- `.optional()`, `.default(value)`, `.meta({ desc })`, `.extend({...})`
- `parse(obj)`, `map(obj, fn)`
- `serializeSchema(schema)` - Converts a schema to a plain JSON object
- `deserializeSchema(json)` - Reconstructs a schema from a JSON object

## Notes

- `z.string` and `string` are functionally equivalent, but `z.string` is preferred for consistency and clarity.
- Each schema definition results in a corresponding TypeScript type, which can be extracted using `Infer<typeof schema>`.
