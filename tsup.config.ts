import process from 'node:process'
import type { Options } from 'tsup'

const env = process.env.NODE_ENV

// https://dev.to/orabazu/how-to-bundle-a-tree-shakable-typescript-library-with-tsup-and-publish-with-npm-3c46
// https://github.com/orabazu/tsup-library-template/tree/main

export const tsup: Options = {
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  minify: true, // fixes sideEffects in binary.ts where like 1 << 31
  splitting: true,
  bundle: true,
  skipNodeModulesBundle: true,
  entryPoints: ['src/index.all.ts'],
  target: 'es2020',
  outDir: 'dist',
  entry: ['src/**/*.ts'],
}
