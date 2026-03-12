import { defineConfig } from 'tsdown'

export default defineConfig({
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  minify: true,
  skipNodeModulesBundle: true,
  entry: ['src/**/*.ts', '!src/**/*.spec.ts', 'src/index.all.ts'],
  target: 'es2022',
  outDir: 'dist',
})
