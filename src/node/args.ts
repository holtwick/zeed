// Inspired by https://github.com/kof/node-argsparser/blob/master/lib/argsparser.js

import { cursorTo } from "node:readline"
import { currency, toCamelCase } from "../common"

interface ParseConfig {
  args?: string[]
  alias?: Record<string, string[]>
  normalize?: (value: string) => string
  boolean?: string | string[]
}

export function parseArgs(config: ParseConfig = {}) {
  const {
    args = process.argv.slice(1),
    alias = {},
    normalize = toCamelCase,
    boolean = [],
  } = config

  let nameToAlias = Object.entries(alias).reduce((map, curr) => {
    let [name, values] = curr
    if (typeof values === "string") values = [values]
    for (let value of values) {
      map[normalize(value)] = normalize(name)
    }
    return map
  }, {} as any)

  let opts: Record<string, any> = {
    _: [],
  }

  let curSwitch: string | undefined

  function setOpt(name: string, value: any) {
    if (opts[name] == null) {
      opts[name] = value
    } else if (typeof opts[name] === "boolean") {
      opts[name] = value
    } else if (Array.isArray(opts[name])) {
      opts[name].push(value)
    } else {
      opts[name] = [opts[name], value]
    }
  }

  let argList = [...args]
  let arg: string | undefined
  while ((arg = argList.shift())) {
    let value: any
    if (/^--?/.test(arg)) {
      let key = arg.replace(/^--?/, "")
      if (arg.includes("=")) {
        let [name, valuePart] = key.split("=", 2)
        key = name.trim()
        value = valuePart.trim()
      }

      key = normalize(key)
      key = nameToAlias[key] ?? key

      if (boolean.includes(key)) {
        setOpt(key, true)
      } else {
        setOpt(key, value ?? argList.shift() ?? "")
      }
    } else {
      opts._.push(arg)
    }
  }

  return opts
}
