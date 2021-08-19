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
    if (line.includes("/node_modules/")) {
      return ""
    }

    const fileURL = "file://"
    if (line.startsWith(fileURL)) {
      return line.substr(fileURL.length)
    }

    const cwd = process.cwd()
    if (cwd && line.startsWith(cwd)) {
      return line.substr(cwd.length + 1)
    }

    const home = process.env["HOME"]
    if (home && line.startsWith(home)) {
      line = line.substr(home.length + 1)
    }
  }
  return line || ""
}
