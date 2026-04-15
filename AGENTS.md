# AGENTS.md

Guidance for coding agents working on the zeed repository. For end-user documentation see [README.md](README.md).

## Project

Zero-dependency TypeScript utility library for universal JavaScript (browser, Node, Deno, Bun).

- Zero runtime dependencies
- Strict TypeScript, full type inference
- Tree-shakable ESM with CJS fallback
- Platform split: `src/browser/`, `src/node/`, `src/common/`

## Commands

Package manager: `pnpm` (>= 10). Node >= 20. `nr` is a binary from `@antfu/ni` that runs `package.json` scripts.

```bash
pnpm build            # tsdown build (ESM + CJS + types)
pnpm check            # tsc --noEmit
pnpm watch            # incremental build
pnpm test             # type check + vitest run (node + common)
pnpm coverage         # vitest with coverage
pnpm vitest run path/to/file.spec.ts   # single test file
pnpm test:chromium    # browser tests via playwright (also :firefox, :webkit)
pnpm test:browser     # browser tests with preview UI
pnpm lint             # eslint
pnpm lint:fix
pnpm build:docs       # typedoc -> docs/
```

## Layout

```text
src/
  common/   platform-agnostic (schema, msg, data, log core, ...)
  browser/  DOM, LocalStorage, browser log handler
  node/     fs, env, node log handler
  index.all.ts      universal entry
  index.browser.ts  browser build
  index.node.ts     node build
  index.jsr.ts      JSR registry entry
```

Conditional exports in `package.json` route consumers to the right build. Ignore `_archive/`, `dist/`, `docs/`, `demos/`.

## Subsystems

- **`common/schema/`** - Standard Schema compatible runtime validation, exposed as `z`. `z.object`, `z.string`, `z.stringLiterals`, `.parse`, `.optional`, `.default`, `z.infer`. `schema['~standard']` exposes the Standard Schema interface.
- **`common/msg/`** - Layered messaging: `Emitter` (typed events), `Channel` (postMessage abstraction), `PubSub`, `Messages` (RPC with Promise/timeout/retry), `Encoder`. See `src/common/msg/README.md`.
- **`common/log/`** + platform handlers - `Logger('name')`, levels `info`/`warn`/`error`. Env: `ZEED=*` or `DEBUG=*` (ZEED wins), `ZEED_LEVEL=info`, `ZEED_LOG=/path/file.log`. Handlers: `LoggerConsoleHandler`, `LoggerBrowserHandler`, `LoggerNodeHandler`, `LoggerFileHandler`.
- **`common/data/`** - `arrayUnique`, `arrayShuffle`, `arrayGroupBy`, `camelCase`, `snakeCase`, `slugify`, `useBase(62)`, `deepEqual`, `deepMerge`, `objectFilter`, `objectPluck`, `sortedItems` (CRDT).

## Conventions

- 2-space indent, no tabs.
- Strict TS. Explicit types only where inference is unclear.
- Relative imports within a module, barrel imports across modules.
- Tests live next to code: `array.ts` + `array.spec.ts`. Vitest globals enabled.
- New utilities: aim for 100% coverage.
- Browser-only code in `src/browser/`, node-only in `src/node/`, everything else in `src/common/`.
- Each module has an `index.ts` barrel.

## Build

- Bundler: `tsdown` (rolldown-based). Config in `tsdown.config.ts`.
- Output: `dist/` with `.mjs`, `.cjs`, and `.d.mts`/`.d.cts` declarations per entry (e.g. `dist/index.all.d.mts`, `dist/index.node.d.cts`).
- Features: tree-shaking, minification, source maps, code splitting.

## Release

`pnpm prep` runs lint-fix, type check, full test suite, and doc upload. `pnpm npm:release` publishes to npm. `pnpm build:docs` generates typedoc into `docs/` (published to <https://zeed.holtwick.de/>).
