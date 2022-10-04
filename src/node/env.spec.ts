// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { getEnvVariableRelaxed, setupEnv } from './env'

describe('ENV', () => {
  it('should respect both files', () => {
    const env = {}
    setupEnv({
      // debug: true,
      filename: '.editorconfig',
      prefix: 'tmp_test_lib_',
      env,
    })
    // console.dir(env)
    // @ts-expect-error xxx
    expect(env.tmp_test_lib_charset).toBe('utf-8')
  })

  it('should get relaxed', () => {
    const env = {
      Specific: '1',
      SPECIFIC: '2',
      PROP: '3',
      aProp: '4',
    }
    expect(getEnvVariableRelaxed('Specific', env)).toEqual('1')
    expect(getEnvVariableRelaxed('SPECIFIC', env)).toEqual('2')
    expect(getEnvVariableRelaxed('specific', env)).toEqual('1')
    expect(getEnvVariableRelaxed('prop', env)).toEqual('3')
    expect(getEnvVariableRelaxed('APROP', env)).toEqual('4')
    expect(getEnvVariableRelaxed('unknown', env)).toEqual(undefined)
  })
})
