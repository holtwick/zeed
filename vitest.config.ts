/// <reference types="vitest" />
import { resolve } from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'
import type { UserConfig } from 'vitest'

const isBrowser = +(process.env.BROWSER ?? '0')

const config: UserConfig = {
  // include: ['**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  // exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', '*/_archive/*'],
  snapshotFormat: {
    printBasicPrototype: true,
  },
  // root: './src',
  globals: true,
  alias: {
    '@/': `${resolve(process.cwd(), 'src')}/`,
  },
}

if (isBrowser) {
  Object.assign(config, {
    include: [
      './src/browser/**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      './src/common/**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright', // https://playwright.dev
      providerOptions: {},
    },
  })
}
else {
  Object.assign(config, {
    setupFiles: ['vitest-setup.ts'],
    // include: ['**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', '*/_archive/*'],
    include: [
      './src/node/**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      './src/common/**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      './src/index.spec.ts',
    ],
  })
}

export default defineConfig({
  test: config,
  // https://github.com/vitest-dev/vitest/issues/4183
  esbuild: { target: 'es2022' },
})
