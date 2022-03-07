/** Copy string to clipboard */
export function pbcopy(data: string) {
  return new Promise(async (resolve, reject) => {
    const proc = (await import("child_process")).spawn("pbcopy")
    proc.on("error", (err: any) => reject(err))
    proc.on("close", (err: any) => resolve(data))
    proc.stdin.write(data)
    proc.stdin.end()
  })
}
