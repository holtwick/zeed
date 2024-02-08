import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    ignores: [
      'dist',
      'node_modules',
      'build',
      'tmp',
      // 'demos',
      'docs',
      'coverage',
      '_archive',
      // '*.md',
      // '*.spec.*',
      // 'vitest.config.ts',
    ],
    typescript: {
      tsconfigPath: './tsconfig.json',
    },
    rules: {
      'unused-imports/no-unused-vars': 'off',
      'ts/no-unsafe-assignment': 'off',
      'ts/no-unsafe-return': 'off',
      'ts/no-unsafe-member-access': 'off',
      'ts/no-unsafe-argument': 'off',
      'ts/no-unsafe-call': 'off',
      'ts/restrict-template-expressions': 'off',
      'ts/no-misused-promises': 'off',
      // 'ts/no-floating-promises': 'error',
      // 'ts/require-await': 'error',
    },
  },
)
