import process from 'node:process'
import type { Options } from 'tsup'

const env = process.env.NODE_ENV

// https://dev.to/orabazu/how-to-bundle-a-tree-shakable-typescript-library-with-tsup-and-publish-with-npm-3c46
// https://github.com/orabazu/tsup-library-template/tree/main

export const tsup: Options = {
  splitting: true,
  sourcemap: env === 'production', // source map is only available in prod
  clean: true, // rimraf disr
  dts: true, // generate dts file for main module
  format: ['cjs', 'esm'], // generate cjs and esm files
  minify: false, // env === 'production',
  bundle: false, // env === 'production',
  skipNodeModulesBundle: true,
  entryPoints: ['src/index.all.ts'],
  // watch: env === 'development',
  target: 'es2020',
  outDir: 'dist', // env === 'production' ? 'dist' : 'lib',
  // entry: ['src/**/*[!.spec].ts'],
  entry: ['src/**/*.ts'],
}
