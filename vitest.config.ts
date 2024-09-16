import type { UserConfig } from 'vitest'
/// <reference types="vitest" />
/* eslint-disable no-console */
import { resolve } from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'
import { valueToBooleanNotFalse } from './src/common/data/convert'

const config: UserConfig = {
  snapshotFormat: {
    printBasicPrototype: true,
  },
  globals: true,
  alias: {
    '@/': `${resolve(process.cwd(), 'src')}/`,
  },
  // include: ['**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  // root: './src',
}

const isPreview = process.env.PREVIEW && valueToBooleanNotFalse(process.env.PREVIEW)
const isBrowser = process.env.BROWSER && valueToBooleanNotFalse(process.env.BROWSER)

const browserName = {
  c: 'chromium',
  chromium: 'chromium',
  chrome: 'chromium',
  g: 'chromium',
  google: 'chromium',
  e: 'chromium',
  edge: 'chromium',
  w: 'webkit',
  webkit: 'webkit',
  s: 'webkit',
  safari: 'webkit',
  f: 'firefox',
  firefox: 'firefox',
}[String(process.env.BROWSER).toLowerCase()] ?? 'chromium'

if (isBrowser || isPreview) {
  console.info('BROWSER', browserName, JSON.stringify(process.env.BROWSER))
  Object.assign(config, {
    include: [
      './src/browser/**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      './src/common/**/*.{client,test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      '**/_archive/**',
      '**/demos/**',
      '**/docs/**',
    ],
    browser: {
      enabled: true,
      name: browserName,
      provider: isPreview ? 'preview' : 'playwright', // https://playwright.dev
      providerOptions: {
        launch: {
          devtools: true,
        },
      },
    },
  })
}
else {
  console.info('NODE')

  Object.assign(config, {
    setupFiles: ['vitest-setup.ts'],
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
  esbuild: {
    target: 'es2022',
  },
})
