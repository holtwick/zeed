export function parseArgs(args?: string[]) {
  let opts: Record<string, any> = {}
  let curSwitch: string

  // args is optional, default is process.argv
  args = args ?? process.argv

  args.forEach(function (arg: string) {
    // its a switch
    if (/^(-|--)/.test(arg) || !curSwitch) {
      opts[arg] = true
      curSwitch = arg
      // this arg is a data
    } else {
      let value: any = arg
      if (arg === "false") {
        value = false
      } else if (arg === "true") {
        value = true
      }

      // it was a boolean switch per default,
      // now it has got a val
      if (typeof opts[curSwitch] === "boolean") {
        opts[curSwitch] = value
      } else if (Array.isArray(opts[curSwitch])) {
        opts[curSwitch].push(value)
      } else {
        opts[curSwitch] = [opts[curSwitch], value]
      }
    }
  })
  return opts
}
