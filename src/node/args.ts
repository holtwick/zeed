// Inspired by https://github.com/kof/node-argsparser/blob/master/lib/argsparser.js

import { toCamelCase } from "../common"

interface ParseConfig {
  args?: string[]
  alias?: Record<string, string[]>
  normalize?: (value: string) => string
}

export function parseArgs(config: ParseConfig = {}) {
  const {
    args = process.argv.slice(1),
    alias = {},
    normalize = toCamelCase,
  } = config

  let nameToAlias = Object.entries(alias).reduce((map, curr) => {
    let [name, values] = curr
    if (typeof values === "string") values = [values]
    for (let value of values) {
      map[normalize(value)] = normalize(name)
    }
    return map
  }, {} as any)

  let opts: Record<string, any> = {}
  let curSwitch: string | undefined

  for (let arg of args) {
    let value: any = arg

    if (/^--?/.test(arg) || curSwitch == null) {
      curSwitch = arg.replace(/^--?/, "")

      if (arg.includes("=")) {
        let [name, valuePart] = curSwitch.split("=", 2)
        curSwitch = name.trim()
        value = valuePart.trim()
      } else {
        value = true
      }

      curSwitch = normalize(curSwitch)
      curSwitch = nameToAlias[curSwitch] ?? curSwitch
    }

    if (curSwitch != null) {
      if (arg === "false") {
        value = false
      } else if (arg === "true") {
        value = true
      }

      if (opts[curSwitch] == null) {
        opts[curSwitch] = value
      } else if (typeof opts[curSwitch] === "boolean") {
        opts[curSwitch] = value
      } else if (Array.isArray(opts[curSwitch])) {
        opts[curSwitch].push(value)
      } else {
        opts[curSwitch] = [opts[curSwitch], value]
      }
    }
  }

  return opts
}
