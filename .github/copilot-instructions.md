# Zeed AI Coding Instructions

Ignore files in the folders: `_archive`, `dist` and `docs`.

## Project Structure & Architecture

- **Universal TypeScript library**: Code is written in strict TypeScript and targets browser, Node.js, Deno, and Bun. See `src/` for main modules.
- **Zero dependencies**: All code is self-contained and tree-shakable.
- **Major modules**:
  - `src/common/`: Core utilities, schema, data, and messaging primitives. Platform-agnostic.
  - `src/common/schema/`: Schema definitions and validation utilities.
  - `src/common/data/`: Data structures and utilities.  
  - `src/common/msg/`: Messaging abstractions (Emitter, Channel, PubSub, Messages, Encoder). See `src/common/msg/README.md` for architecture and usage.
  - `src/node/`: Platform-specific utilities for Node.js, Deno, and Bun.
  - `src/browser/`: Platform-specific utilities for browsers.
  - `demos/`, `tests/`, `docs/`: Examples, test harnesses, and documentation.

## Key Patterns & Conventions

- **Indentation**: Always use 2 spaces.
- **Testing**: All test files must end with `.spec.ts` and be located side-by-side with the code they test (e.g., `src/common/schema/schema.spec.ts`). Vitest is used for testing. Aim for 100% coverage.
- **Linting**: Use `pnpm lint:fix` to fix linting issues.
- **TypeScript types**: Use strict typing everywhere. 
- **Object schemas**: Use the `Type` class and helpers in `src/common/schema/schema.ts` for runtime type validation and inference.
- **Messaging**: Use the `Emitter`, `Channel`, `PubSub`, and `Messages` patterns for cross-component and cross-context communication. See `src/common/msg/README.md` for details and examples.
- **Logging**: Use the `Logger` utility (`import { Logger } from 'zeed'`). Logging is globally configurable and supports filtering by namespace and level. See README for environment variable usage.

## Developer Workflows

- **Build**: Use `pnpm build` (runs `tsup` with ESM/CJS, minification, and type generation).
- **Test**: Use `pnpm test --run` for all tests. Test coverage: `pnpm coverage`.
- **Lint**: Use `pnpm lint` and `pnpm lint:fix`.
- **Docs**: API docs are generated with `pnpm build:docs` and published to https://zeed.holtwick.de/.
- **Debugging**: For Node.js, enable source maps with `node --enable-source-maps ...`.

## Integration & External Dependencies

- **No runtime dependencies**: All integrations (e.g., `base-x`, `debug`, `dotenv`) are vendored or optional.
- **Messaging**: Designed to work with browser APIs (`postMessage`, `BroadcastChannel`, etc.) and Node.js.
- **Logging**: Integrates with environment variables (`ZEED`, `DEBUG`, `ZEED_LEVEL`, etc.) for flexible configuration.

## Examples

- **Schema definition**:
  ```ts
  import { z } from 'zeed'
  const schemaExample = object({ name: z.string(), age: z.number().optional() })
  type SchemaExample = z.infer<typeof schemaExample>
  ```
- **Typed event emitter**:
  ```ts
  interface Events { inc: (n: number) => void }
  const e = new Emitter<Events>()
  e.on('inc', n => ...)
  ```

## References

- See `README.md` and `src/common/msg/README.md` for more usage patterns and architectural rationale.
