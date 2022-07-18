// Inspired by https://github.com/kof/node-argsparser/blob/master/lib/argsparser.js

export function parseArgs(args?: string[]) {
  let opts: Record<string, any> = {}
  let curSwitch: string | undefined

  // args is optional, default is process.argv
  args = args ?? process.argv

  for (let arg of args) {
    if (/^(-|--)/.test(arg) || !curSwitch) {
      if (arg.includes("=")) {
        let [name, value] = arg.split("=", 2)
        opts[name] = value
      } else {
        opts[arg] = true
        curSwitch = arg
      }
      continue
    }

    let value: any = arg
    if (arg === "false") {
      value = false
    } else if (arg === "true") {
      value = true
    }

    if (typeof opts[curSwitch] === "boolean") {
      opts[curSwitch] = value
    } else if (Array.isArray(opts[curSwitch])) {
      opts[curSwitch].push(value)
    } else {
      opts[curSwitch] = [opts[curSwitch], value]
    }
  }

  return opts
}
