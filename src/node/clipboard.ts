/** Copy string to clipboard */
export function pbcopy(data: string) {
  return new Promise(function (resolve, reject) {
    const proc = require("child_process").spawn("pbcopy")
    proc.on("error", (err: any) => reject(err))
    proc.on("close", (err: any) => resolve(data))
    proc.stdin.write(data)
    proc.stdin.end()
  })
}
