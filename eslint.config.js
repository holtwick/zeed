import antfu from '@antfu/eslint-config'
import { eslintIgnoreDefaults, eslintRulesDefaults } from './src/common/eslint-defaults.js'

export default antfu(
  {
    typescript: true,
    vue: true,
    ignores: eslintIgnoreDefaults(),
  },
  {},
  {
    rules: {
      ...eslintRulesDefaults(),
      'unicorn/consistent-function-scoping': 'off',
    },
  },
)
