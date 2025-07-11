import antfu from '@antfu/eslint-config'
import { eslintIgnoreDefaults, eslintRulesDefaults } from './src/eslint-defaults.js'

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
    },
  },
)
