// Inspired by https://github.com/kof/node-argsparser/blob/master/lib/argsparser.js

import process from 'node:process'
import { toCamelCase } from '../common/data/camelcase'

/**
 * Represents the configuration options for parsing command line arguments.
 */
export interface ParseConfig {
  args?: string[]
  alias?: Record<string, string[]>
  normalize?: (value: string) => string
  booleanArgs?: string | string[]
  listArgs?: string | string[]
  numberArgs?: string | string[]
}

/**
 * Parses command line arguments and returns an object containing the parsed options.
 *
 * @param config - Configuration options for parsing the arguments.
 * @returns An object containing the parsed options.
 */
export function parseArgs(config: ParseConfig = {}) {
  const {
    args = process.argv.slice(1),
    alias = {},
    normalize = toCamelCase,
    booleanArgs = [],
    listArgs = [],
    numberArgs = [],
  } = config

  const nameToAlias = Object.entries(alias).reduce((map, curr) => {
    let [name, values] = curr
    if (typeof values === 'string')
      values = [values]
    for (const value of values)
      map[normalize(value)] = normalize(name)

    return map
  }, {} as any)

  const opts: Record<string, any> = {
    _: [],
  }

  function setOpt(name: string, value: any) {
    if (opts[name] == null)
      opts[name] = value

    else if (typeof opts[name] === 'boolean')
      opts[name] = value

    else if (Array.isArray(opts[name]))
      opts[name].push(value)

    else
      opts[name] = [opts[name], value]
  }

  const argList = [...args]
  let arg: string | undefined

  // eslint-disable-next-line no-cond-assign
  while ((arg = argList.shift())) {
    let value: any
    if (/^--?/.test(arg)) {
      let key = arg.replace(/^--?/, '')
      if (arg.includes('=')) {
        const [name, valuePart] = key.split('=', 2)
        key = name.trim()
        value = valuePart.trim()
      }
      key = normalize(key)
      key = nameToAlias[key] ?? key
      if (booleanArgs.includes(key)) {
        setOpt(key, true)
      }
      else {
        value = value ?? argList.shift() ?? ''
        if (numberArgs.includes(key))
          value = Number(value ?? 0)

        if (listArgs.includes(key)) {
          if (Array.isArray(opts[key]))
            opts[key].push(value)

          else
            opts[key] = [value]
        }
        else {
          setOpt(key, value)
        }
      }
    }
    else {
      opts._.push(arg)
    }
  }

  return opts
}
