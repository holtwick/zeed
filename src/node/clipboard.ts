/** Copy string to clipboard */
export function pbcopy(data: string) {
  return new Promise(
    (resolve, reject) => {
      import('node:child_process').then(({ spawn }) => {
        const proc = spawn('pbcopy')
        proc.on('error', (err: any) => reject(err))
        proc.on('close', () => resolve(data))
        proc.stdin.write(data)
        proc.stdin.end()
      }).catch(() => {})
    },
  )
}
