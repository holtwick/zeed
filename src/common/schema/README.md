# Schema Type System

This module provides a flexible, TypeScript-friendly schema/type system for runtime validation, parsing, and type inference. It is inspired by libraries like [valita](https://github.com/badrap/valita) and implements the [Standard Schema](https://github.com/standard-schema/standard-schema) specification.

## Features

- Define schemas for primitives, objects, arrays, tuples, unions, literals, records, and functions
- Parse and validate data at runtime
- Type inference for static TypeScript types
- Schema transformation: `.pick()`, `.omit()`, `.partial()`, `.required()`, `.extend()`
- Serialize/deserialize schemas to/from JSON
- Export schemas to TypeScript interfaces, Swift structs, or JSON Schema
- Parse environment variables and CLI arguments against a schema
- **Standard Schema V1 compatible** - works with tRPC, TanStack Form/Router, Hono, and other compatible libraries

## Standard Schema Compatibility

All zeed schemas implement the [StandardSchemaV1](https://github.com/standard-schema/standard-schema) interface, making them compatible with a growing ecosystem of tools and frameworks. This means you can use zeed schemas anywhere that accepts standard-schema-compliant validators.

### Using with Standard Schema

Every schema has a `~standard` property that provides the standard interface:

```ts
import { z } from 'zeed'

const schema = z.object({
  name: z.string(),
  age: z.number(),
})

// Access standard schema interface
const result = schema['~standard'].validate({ name: 'Alice', age: 30 })

if (result.issues) {
  console.error('Validation errors:', result.issues)
}
else {
  console.log('Valid data:', result.value)
}
```

### Standard Schema Properties

The `~standard` property provides:

- `version`: Always `1` (the specification version)
- `vendor`: `'zeed'` (identifies the schema library)
- `validate(value)`: Synchronous validation function that returns either success or failure
- `types`: Type metadata for TypeScript type inference

### Type Inference

```ts
import type { StandardSchemaV1 } from 'zeed'
import { z } from 'zeed'

const schema = z.object({
  email: z.string(),
  age: z.number().optional(),
})

// Extract input/output types via standard schema helpers
type Input = StandardSchemaV1.InferInput<typeof schema>
type Output = StandardSchemaV1.InferOutput<typeof schema>

// Or use zeed's own type inference
type User = z.infer<typeof schema>
```

### Compatible Libraries

Zeed schemas work with any library that supports Standard Schema, including tRPC, TanStack Form, TanStack Router, Hono and more. See the [full list](https://github.com/standard-schema/standard-schema#what-tools--frameworks-accept-spec-compliant-schemas).

### Generic Validation Function Example

```ts
import type { StandardSchemaV1 } from 'zeed'
import { z } from 'zeed'

function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  data: unknown,
): StandardSchemaV1.InferOutput<T> {
  const result = schema['~standard'].validate(data)
  if (result.issues)
    throw new Error(`Validation failed: ${JSON.stringify(result.issues)}`)
  return result.value
}

const userSchema = z.object({ name: z.string() })
const user = standardValidate(userSchema, { name: 'Alice' })
```

## Basic Usage

### Primitives

```ts
import { z } from 'zeed'

const name = z.string()
const age = z.number()
const count = z.int()
const flag = z.boolean()
const nothing = z.none() // undefined | null
const whatever = z.any()

// Numeric aliases for number()
const x = z.float()
const y = z.double()
const r = z.real()
```

### Objects

```ts
import { z } from 'zeed'

const user = z.object({
  name: z.string(),
  age: z.number().optional(),
})
// Type: { name: string; age?: number }
```

### Arrays and Tuples

```ts
import { z } from 'zeed'

const tags = z.array(z.string())
// Type: string[]

const pair = z.tuple([z.string(), z.number()])
// Type: [string, number]
```

### Records

```ts
import { z } from 'zeed'

const scores = z.record(z.number())
// Type: Record<string, number>
```

### Unions and Literals

```ts
import { z } from 'zeed'

const status = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
// Type: 'active' | 'inactive'

const role = z.enum(['admin', 'user', 'guest'])
// Type: 'admin' | 'user' | 'guest'
// Note: z.enum is an alias for stringLiterals
```

### Type Inference

```ts
import { z } from 'zeed'

const user = z.object({ name: z.string(), age: z.number().optional() })
type User = z.infer<typeof user>
// { name: string; age?: number }
```

### Parsing

```ts
import { z } from 'zeed'

const user = z.object({ name: z.string(), age: z.number().optional() })
const parsed = user.parse({ name: 'Alice', age: 30 })
```

### Optional and Default Values

```ts
import { z } from 'zeed'

const score = z.number().optional().default(0)
// Type: number | undefined (default: 0)

// Default can also be a function
const id = z.string().default(() => crypto.randomUUID())
```

### Metadata and Descriptions

```ts
import { z } from 'zeed'

const name = z.string().meta({ desc: 'The user name' })
const age = z.number().describe('Age in years')
```

### Function and RPC Types

```ts
import { z } from 'zeed'

const add = z.func([z.number(), z.number()], z.number())
// Type: (a: number, b: number) => number

const rpcCall = z.rpc(z.object({ id: z.string() }), z.number())
// Type: (info: { id: string }) => number | Promise<number>
```

## Object Schema Transformations

Object schemas support composition methods similar to Zod:

```ts
import { z } from 'zeed'

const user = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  age: z.number(),
})

// Extend with additional fields
const userWithRole = user.extend({ role: z.string() })

// Pick a subset of fields
const userName = user.pick({ id: true, name: true })

// Omit fields
const userWithoutEmail = user.omit({ email: true })

// Make all (or selected) fields optional
const partialUser = user.partial()
const partialByKey = user.partial({ age: true })

// Make all (or selected) fields required
const requiredUser = partialUser.required()
```

## Serialization and Deserialization

Serialize schemas to plain JSON and reconstruct them later. Useful for sending schemas over the network or persisting them.

```ts
import { deserializeSchema, serializeSchema, z } from 'zeed'

const userSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
  role: z.enum(['admin', 'user']).default('user'),
})

const serialized = serializeSchema(userSchema)
const jsonString = JSON.stringify(serialized)

const deserialized = deserializeSchema(JSON.parse(jsonString))
const user = deserialized.parse({ name: 'Alice', role: 'admin' })
```

**Note**: Function defaults (e.g., `.default(() => 'value')`) cannot be serialized and are omitted. Only static default values are preserved.

## Parsing Environment Variables

Map a flat object schema onto `process.env`. Field names are converted from camelCase to `UPPER_SNAKE_CASE`.

```ts
import { parseSchemaEnv, stringFromSchemaEnv, z } from 'zeed'

const envSchema = z.object({
  port: z.int().default(3000).meta({ envDesc: 'Server port' }),
  dbUrl: z.string().meta({ envDesc: 'Database connection URL' }),
  debug: z.boolean().default(false),
  secret: z.string().meta({ envPrivate: true }),
})

const env = parseSchemaEnv(envSchema)
// Reads PORT, DB_URL, DEBUG, SECRET from process.env

// Generate a .env template (private fields are hidden unless showPrivate=true)
const template = stringFromSchemaEnv(envSchema)
```

Supported `meta` fields: `envDesc`, `envPrivate`, `envSkip`.

## Parsing CLI Arguments

```ts
import { helpSchemaArgs, parseSchemaArgs, z } from 'zeed'

const argsSchema = z.object({
  input: z.string().meta({ argShort: 'i', argDesc: 'Input file' }),
  verbose: z.boolean().default(false).meta({ argShort: 'v' }),
  count: z.int().default(1),
})

const [args, rest] = parseSchemaArgs(argsSchema) // reads process.argv
const help = helpSchemaArgs(argsSchema)
```

Supported `meta` fields: `argShort`, `argDesc`.

## Exporting Schemas

### TypeScript Interface

```ts
import { schemaExportTypescriptInterface, z } from 'zeed'

const user = z.object({
  name: z.string(),
  age: z.int().optional(),
})

const ts = schemaExportTypescriptInterface(user, 'User')
// export interface User { name: string; age?: number }
```

### Swift Struct

```ts
import { schemaExportSwiftStruct, z } from 'zeed'

const user = z.object({
  name: z.string(),
  age: z.int().optional(),
})

const swift = schemaExportSwiftStruct(user, 'User')
```

Supported `meta` fields: `swiftName`, `swiftProtocol`, `swiftDesc`, `swiftDefault`.

### JSON Schema

```ts
import { schemaExportJsonSchema, schemaExportJsonSchemaString, z } from 'zeed'

const user = z.object({
  name: z.string(),
  age: z.number().optional(),
})

const jsonSchema = schemaExportJsonSchema(user)
const jsonSchemaStr = schemaExportJsonSchemaString(user)
```

## API Reference

### Primitives

- `z.string()`, `z.number()`, `z.int()`, `z.boolean()`, `z.none()`, `z.any()`
- `z.float()`, `z.double()`, `z.real()` - aliases for `z.number()`

### Composites

- `z.object({...})`, `z.array(type)`, `z.tuple([...])`, `z.record(type)`
- `z.union([...])`
- `z.literal(value)`, `z.stringLiterals([...])`, `z.enum([...])`
- `z.func(args, ret)`, `z.rpc(info, ret)`

### Type methods

- `.optional()`, `.default(value | fn)`
- `.meta({ desc, ... })`, `.describe(msg)`
- `.parse(obj)`
- Object only: `.extend({...})`, `.pick({...})`, `.omit({...})`, `.partial()`, `.partial({...})`, `.required()`, `.required({...})`

### Type inference helpers

- `z.infer<typeof schema>`

### Serialization

- `serializeSchema(schema)` - Convert a schema to a plain JSON object
- `deserializeSchema(json)` - Reconstruct a schema from a JSON object

### Parsing helpers

- `schemaCreateObject(schema)` - Build an object from defaults
- `schemaParseObject(schema, obj, opt?)` - Parse and coerce an object against a schema
- `schemaValidateObject(schema, obj, opt?)` - Validate without coercion, returns issues

### Environment and CLI

- `parseSchemaEnv(schema, opt?)`, `stringFromSchemaEnv(schema, prefix?, commentOut?, showPrivate?)`
- `parseSchemaArgs(schema, argv?)`, `helpSchemaArgs(schema)`

### Exporters

- `schemaExportTypescriptInterface(schema, name?)`
- `schemaExportSwiftStruct(schema, name?)`
- `schemaExportJsonSchema(schema)`, `schemaExportJsonSchemaString(schema)`

### Utilities

- `isSchemaObject(schema)`, `isSchemaObjectFlat(schema)`
- `isSchemaOptional(schema)`, `isSchemaDefault(schema)`, `isSchemaPrimitive(schema)`

## Notes

- `z.string()` and the bare `string()` export are functionally equivalent, but `z.string()` is preferred for consistency and clarity.
- Each schema definition results in a corresponding TypeScript type, extractable via `z.infer<typeof schema>`.
