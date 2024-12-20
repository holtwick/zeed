export function eslintIgnoreDefaults() {
  return [
    '**/_*/*',
    '**/.*/*',
    '**/.DS_* ',
    '**/.env.*',
    '**/.htaccess',
    '**/.htaccess*',
    '**/build/*',
    '**/coverage/*',
    '**/data/*',
    '**/dist_*/*',
    '**/dist/*',
    '**/docker/*',
    '**/internal/*',
    '**/legacy/*',
    '**/logs/*',
    '**/node_modules/*',
    '**/npm-debug.log',
    '**/package-lock.json',
    '**/pnpm-lock.yaml',
    '**/tmp/*',
    '**/www/*',
  ]
}

/// Very much opiniated ESLint setting! Details to rules see https://eslint.org/docs/latest/rules/
export function eslintRulesDefaults() {
  return {
    // for some old third party code a `eslint-disable` does wonders :)
    'eslint-comments/no-unlimited-disable': 'off',

    'unused-imports/no-unused-vars': 'off',
    'ts/no-unsafe-assignment': 'off',
    'ts/no-unsafe-return': 'off',
    'ts/no-unsafe-member-access': 'off',
    'ts/no-unsafe-argument': 'off',
    'ts/no-unsafe-call': 'off',
    'ts/restrict-template-expressions': 'off',
    'ts/no-misused-promises': 'off',

    // await / async
    // 'ts/no-floating-promises': 'error',
    // 'ts/require-await': 'error',

    // All import properties in one line
    'object-curly-newline': ['error', {
      ImportDeclaration: 'never',
      // ExportDeclaration: 'always'
    }],

    'unicorn/consistent-function-scoping': 'off',
  }
}

/** @deprecated */
export function eslintDefaults(opt) {
  const { ignores = [], rules = {}, ...rest } = opt ?? {}

  // https://github.com/antfu/eslint-config?tab=readme-ov-file#antfueslint-config
  return {
    vue: true,
    typescript: true,
    regexp: true,

    ...rest,

    ignores: [
      ...eslintIgnoreDefaults(),
      ...ignores,
    ],

    // https://eslint.org/docs/latest/rules/
    rules: {
      ...eslintRulesDefaults(),
      ...rules,
    },
  }
}
