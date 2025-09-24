# AGENTS.md

## Dev environment tips

- Use `pnpm install` to install dependencies.
- Run `pnpm build` to build the library (runs `tsup` with ESM/CJS, minification, and type generation).
- Check `package.json` for available scripts.
- Read JSDoc comments in source files (`src/**/*.ts`) for inline API documentation and usage examples.
- Run and examine test specs (`src/**/*.spec.ts`) to understand functionality, expected behavior, and integration patterns.
- Check `README.md` for project overview, architecture, and usage patterns.
- See `docs/` folder for generated API documentation (run `pnpm build:docs` to update).

## Testing instructions

- Run `pnpm test --run` to run all tests with Vitest.
- Run `pnpm coverage` to check test coverage (aim for 100%).
- Run `pnpm lint` to check linting with ESLint.
- Run `pnpm lint:fix` to auto-fix linting issues.
- Fix any test or type errors until the whole suite is green.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions

- Title format: [zeed] <Title>
- Always run `pnpm lint:fix` and `pnpm test --run` before committing.
