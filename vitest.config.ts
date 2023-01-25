/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    setupFiles: ['vitest-setup.ts'],
    include: ['./src/**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    snapshotFormat: {
      printBasicPrototype: true,
    },
    // root: './src',
    globals: true,
  },
})
