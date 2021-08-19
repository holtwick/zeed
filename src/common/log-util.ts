// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

export function getStackLlocationList(stack: string): any[] {
  if (typeof stack !== "string") return []
  // console.log("stack", stack)
  return (
    stack
      ?.split("\n")
      ?.map((rawLine) => {
        let m = rawLine.match(/^\s+at.*(\((.*)\)|file:\/\/(.*)$)/)
        if (m) {
          let line = m[3] || m[2]
          if (line.endsWith(")")) line = line.slice(0, -1)
          return line
        }
      })
      ?.filter((v) => v != null) || []
  )
}

/**
 * Get the source code location of the caller
 * https://stackoverflow.com/a/47296370/140927
 *
 * @param level Number of levels to go down the stack trace
 * @param stripCwd Strip the current working directory, only reasonable for Node.js environment
 * @returns
 */
export function getSourceLocation(level = 2, stripCwd = true): string {
  let stack = new Error().stack || ""
  let line: string | undefined = getStackLlocationList(stack)?.[level]
  if (line && stripCwd) {
    if (line.startsWith("file://")) {
      line = line.substr("file://".length)
    }
    if (line.startsWith(process.cwd())) {
      line = line.substr(process.cwd().length + 1)
    }
  }
  return line || ""
}
