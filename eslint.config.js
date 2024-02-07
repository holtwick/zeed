import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    vue: true,
    ignores: [
      'dist',
      'node_modules',
      'build',
      'tmp',
      'demos',
      'docs',
      'coverage',
      '_archive',
      // '*.spec.*',
      'vitest.config.ts',
    ],
    // typescript: {
    //   tsconfigPath: 'tsconfig.json',
    // },
  },
  // {},
  {
    rules: {
      'unused-imports/no-unused-vars': 'off',
      // 'ts/require-await': 'error',
    },
  },
)
