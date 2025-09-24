import type { Options } from 'tsup'

// https://dev.to/orabazu/how-to-bundle-a-tree-shakable-typescript-library-with-tsup-and-publish-with-npm-3c46
// https://github.com/orabazu/tsup-library-template/tree/main

export const tsup: Options = {
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  minify: true,
  splitting: true,
  bundle: true,
  skipNodeModulesBundle: true,
  entryPoints: ['src/index.all.ts'],
  target: 'es2022',
  outDir: 'dist',
  entry: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
  ],
  keepNames: true,
  esbuildOptions(options) {
    options.keepNames = true
  },
}
