/* eslint-disable style/no-tabs */

import { getEnvVariableRelaxed, parseEnvString, parseEnvStringAlt, setupEnv } from './env'

describe('eNV', () => {
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

  it('should parse a complex Docker .env file', () => {
    const envSample = `
      # This is a comment
      VAR1=unquotedValue
      VAR2= "double quoted value"
      VAR3 = 'single quoted value'
      VAR4=unquotedValue # inline comment
      VAR5=unquotedValue#not a comment
      VAR6="double quoted # not a comment"
      VAR7="double quoted value" # comment
      VAR8='$OTHER'
      VAR9='\${OTHER}'
      VAR10='Let\'s go!'
      VAR11="{"hello": \"json\"}"
      VAR12="some\tvalue"
      VAR13='some\tvalue'
      VAR14=some\tvalue
      `

    expect(envSample).toMatchInlineSnapshot(`
      "
            # This is a comment
            VAR1=unquotedValue
            VAR2= "double quoted value"
            VAR3 = 'single quoted value'
            VAR4=unquotedValue # inline comment
            VAR5=unquotedValue#not a comment
            VAR6="double quoted # not a comment"
            VAR7="double quoted value" # comment
            VAR8='$OTHER'
            VAR9='\${OTHER}'
            VAR10='Let's go!'
            VAR11="{"hello": "json"}"
            VAR12="some	value"
            VAR13='some	value'
            VAR14=some	value
            "
    `)

    expect(parseEnvString(envSample)).toMatchInlineSnapshot(`
      Object {
        "VAR1": "unquotedValue",
        "VAR10": "Let's go!",
        "VAR11": "{"hello": "json"}",
        "VAR12": "some	value",
        "VAR13": "some	value",
        "VAR14": "some	value",
        "VAR2": "double quoted value",
        "VAR3": "single quoted value",
        "VAR4": "unquotedValue # inline comment",
        "VAR5": "unquotedValue#not a comment",
        "VAR6": "double quoted # not a comment",
        "VAR7": ""double quoted value" # comment",
        "VAR8": "$OTHER",
        "VAR9": "\${OTHER}",
      }
    `)

    expect(parseEnvStringAlt(envSample)).toMatchInlineSnapshot(`
      Object {
        "VAR1": "unquotedValue",
        "VAR10": "Let's go!",
        "VAR11": "{"hello": "json"}",
        "VAR12": "some	value",
        "VAR13": "some	value",
        "VAR14": "some	value",
        "VAR2": "double quoted value",
        "VAR3": "single quoted value",
        "VAR4": "unquotedValue",
        "VAR5": "unquotedValue",
        "VAR6": "double quoted # not a comment",
        "VAR7": "double quoted value",
        "VAR8": "$OTHER",
        "VAR9": "\${OTHER}",
      }
    `)
  })
})

it('should parse literal multiline quoted values with parseEnvStringAlt', () => {
  const envSample = `MULTI="first
second"`

  expect(parseEnvStringAlt(envSample)).toEqual({ MULTI: 'first\nsecond' })
})

it('should expand escaped newlines in double-quoted values', () => {
  const envSample = 'ESCAPED="line1\\nline2"'
  expect(parseEnvStringAlt(envSample)).toEqual({ ESCAPED: 'line1\nline2' })
})

it('should expand escaped CR and LF sequences in double-quoted values', () => {
  const envSample = 'CRLF="one\\r\\nsecond"\r\n'
  expect(parseEnvStringAlt(envSample)).toEqual({ CRLF: 'one\r\nsecond' })
})

it('should support backtick-quoted values containing quotes', () => {
  const envSample = 'BACKTICK_KEY=`This has \'single\' and "double" quotes inside of it.`'
  expect(parseEnvStringAlt(envSample)).toEqual({ BACKTICK_KEY: 'This has \'single\' and "double" quotes inside of it.' })
})

it('should preserve escaped backticks inside backtick-quoted values', () => {
  const BS = String.fromCharCode(92) // backslash
  const BT = String.fromCharCode(96) // backtick
  // Build: ESC_BACK=`contains \`backtick\`` (with literal backslashes before backticks)
  const envSample = `ESC_BACK=${BT}contains ${BS}${BT}backtick${BS}${BT}${BT}`
  const expectedInner = `contains ${BS}${BT}backtick${BS}${BT}`
  expect(parseEnvStringAlt(envSample)).toEqual({ ESC_BACK: expectedInner })
})

it('should handle nested quotes in single-quoted values', () => {
  const envSample = 'NESTED=\'He said "hello"\''
  expect(parseEnvStringAlt(envSample)).toEqual({ NESTED: 'He said "hello"' })
})

it('should not expand unicode escapes in double-quoted values (keeps \\uXXXX)', () => {
  const envSample = String.raw`UNICODE="\u2764"`
  // parseEnvStringAlt will remove surrounding quotes and will not convert \u2764 to the heart char
  expect(parseEnvStringAlt(envSample)).toEqual({ UNICODE: '\\u2764'.replace('\\\\', '\\') })
})
