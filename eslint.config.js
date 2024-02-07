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
      '*.spec.*',
      'vitest.config.ts',
    ],
  },
  {},
  {
    rules: {
      'unused-imports/no-unused-vars': 'off',
      'antfu/consistent-list-newline': 'off',
      'eslint-disable-unused-imports/no-unused-imports': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
)
