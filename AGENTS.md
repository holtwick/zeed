# AGENTS.md

## Project Overview

Zeed is a zero-dependency TypeScript utility library designed for universal JavaScript (browsers, Node.js, Deno, and Bun). It provides core utilities for logging, messaging, schema validation, event handling, async operations, and more.

**Key characteristics:**
- Zero runtime dependencies (all integrations are vendored or optional)
- Strict TypeScript with full type inference
- Tree-shakable ESM with CommonJS fallback
- Platform-specific code split between `src/browser/`, `src/node/`, and `src/common/`

## Commands

### Building and Development
```bash
# Build the library (ESM + CJS with minification and types)
pnpm build

# Type checking without compilation
pnpm check

# Watch mode for development
pnpm watch
```

### Testing
```bash
# Run all tests (Node.js + common)
pnpm test

# Run tests with coverage report
pnpm coverage

# Run specific test file
pnpm test <filename>.spec.ts

# Run browser tests in different browsers
pnpm test:browser      # Chromium with preview
pnpm test:chromium     # Chromium via playwright
pnpm test:firefox      # Firefox via playwright
pnpm test:webkit       # WebKit via playwright
```

### Linting
```bash
# Check for linting issues
pnpm lint

# Auto-fix linting issues
pnpm lint:fix
```

### Documentation
```bash
# Generate API documentation (published to https://zeed.holtwick.de/)
pnpm build:docs
```

## Architecture

### Module Structure

The codebase is organized into three main areas:

1. **`src/common/`** - Platform-agnostic utilities
   - Core functionality that works everywhere (browser, Node.js, Deno, Bun)
   - Includes: schema validation, messaging, data utilities, logging foundation, etc.

2. **`src/browser/`** - Browser-specific utilities
   - DOM interactions, LocalStorage, browser-specific logging handlers
   - Example: `log-browser-factory.ts` provides colorful console output for browsers

3. **`src/node/`** - Node.js/Deno/Bun-specific utilities
   - File system operations, process env handling, Node-specific features
   - Example: `env.ts` for environment variable management

### Entry Points

The library uses conditional exports for platform-specific builds:

- **`src/index.all.ts`** - Full universal export (browser + node + common)
- **`src/index.browser.ts`** - Browser-only build (re-exports browser + common)
- **`src/index.node.ts`** - Node-only build (re-exports node + common)
- **`src/index.jsr.ts`** - JSR registry specific export

The `package.json` exports field automatically selects the right build:
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.all.d.ts",
      "node": "./dist/index.node.js",
      "default": "./dist/index.browser.js"
    }
  }
}
```

### Key Subsystems

#### Messaging (`src/common/msg/`)

A layered messaging architecture for cross-context communication. See `src/common/msg/README.md` for full details.

- **Emitter** - Type-safe, async event emitter for in-app communication
- **Channel** - Uniform `postMessage` abstraction for data transport (WebSocket, WebRTC, WebWorker, etc.)
- **PubSub** - Event-like messages over a Channel with type safety
- **Messages** - RPC-like interface with Promise-based responses, timeouts, and retries
- **Encoder** - Transform data for transport (JSON, encryption, etc.)

Example:
```typescript
interface MyMessages {
  echo: (data: any) => Promise<any>
}

const hub = useMessageHub({ channel }).send<MyMessages>()
await hub.echo({ hello: 'world' })
```

#### Schema Validation (`src/common/schema/`)

Type-safe runtime validation with [Standard Schema](https://github.com/standard-schema/standard-schema) compatibility. Works with tRPC, TanStack Form/Router, Hono, and 40+ other libraries.

- Import via `z` namespace: `import { z } from 'zeed'`
- All schemas support `.parse()`, `.optional()`, `.default()`, type inference
- Standard Schema interface available via `schema['~standard']`
- Supports serialization/deserialization for network transport

Example:
```typescript
const userSchema = z.object({
  name: z.string(),
  email: z.string(),
  role: z.stringLiterals(['admin', 'user']),
})

type User = z.infer<typeof userSchema>
const user = userSchema.parse(data)
```

#### Logging (`src/common/log/`, `src/browser/log/`, `src/node/log/`)

Universal logging system with platform-specific handlers:

- **Configuration**: `ZEED=*` or `DEBUG=*` to enable logs (ZEED supersedes DEBUG)
- **Level filtering**: `ZEED_LEVEL=info` to hide debug logs
- **Log to file**: `ZEED_LOG=/path/to/file.log`
- **Handlers**: `LoggerConsoleHandler`, `LoggerBrowserHandler`, `LoggerNodeHandler`, `LoggerFileHandler`

Usage:
```typescript
import { Logger } from 'zeed'

const log = Logger('my-module')
log('message')
log.info('info')
log.warn('warning')
log.error('error')
```

#### Data Utilities (`src/common/data/`)

Extensive collection of data manipulation utilities:
- **Array operations**: `arrayUnique`, `arrayShuffle`, `arrayGroupBy`
- **String utilities**: `camelCase`, `snakeCase`, `slugify`
- **Binary encoding**: `useBase(62)` for Base62 encoding/decoding
- **Object operations**: `deepEqual`, `deepMerge`, `objectFilter`, `objectPluck`
- **CRDT sorting**: `sortedItems` for conflict-free replicated data

## Development Conventions

### Code Style

- **Indentation**: Always use 2 spaces (not tabs)
- **TypeScript**: Strict mode enabled, use explicit types where inference isn't clear
- **Imports**: Use relative imports within the same major module, exported symbols for cross-module

### Testing

- All test files must end with `.spec.ts`
- Tests live side-by-side with the code they test (e.g., `array.ts` → `array.spec.ts`)
- Use Vitest with globals enabled (`describe`, `it`, `expect` available globally)
- Aim for 100% test coverage for new utilities
- Browser tests require explicit environment: `pnpm test:browser`

### File Organization

- Platform-specific code goes in `src/browser/` or `src/node/`
- Shared code goes in `src/common/`
- Each module exports through an `index.ts` barrel file
- Ignore `_archive/`, `dist/`, `docs/`, and `demos/` folders

### Type System Patterns

**Use the `Type` class for runtime validation:**
```typescript
// Define schema
const schema = z.object({ name: z.string() })

// Infer TypeScript type
type Schema = z.infer<typeof schema>

// Parse/validate at runtime
const data = schema.parse(input)
```

**Event emitters should use typed interfaces:**
```typescript
interface MyEvents {
  inc: (count: number) => number
}

const e = new Emitter<MyEvents>()
e.on('inc', async count => count + 1)
```

## Build System

- **Bundler**: tsup (esbuild-based)
- **Output**: ESM + CJS in `dist/` with TypeScript declarations
- **Target**: ES2022
- **Features**: Tree-shaking, minification, source maps, code splitting

The build creates multiple entry points but maintains a single type definition file (`dist/index.all.d.ts`) for simplicity.

## Package Management

- Uses `pnpm` (v10.18.0+)
- Node.js >= 20 required
- The `nr` alias in scripts refers to `ni run` from `@antfu/ni` package
