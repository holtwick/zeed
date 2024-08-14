export function eslintDefaults() {
  return {
    vue: true,
    typescript: true,
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

      // All import properties in one line
      'object-curly-newline': ['error', {
        ImportDeclaration: 'never',
      // ExportDeclaration: 'always'
      }],

    },
  }
}
