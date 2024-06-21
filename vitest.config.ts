/// <reference types="vitest" />
import { resolve } from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    setupFiles: ['vitest-setup.ts'],
    // include: ['**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', '*/_archive/*'],
    include: ['./src/**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    snapshotFormat: {
      printBasicPrototype: true,
    },
    // root: './src',
    globals: true,
    alias: {
      '@/': `${resolve(process.cwd(), 'src')}/`,
    },
  },

  // https://github.com/vitest-dev/vitest/issues/4183
  esbuild: { target: 'es2022' },
})
