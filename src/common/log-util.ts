// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

/**
 * Get the source code location of the caller
 * https://stackoverflow.com/a/47296370/140927
 *
 * @param level Number of levels to go down the stack trace
 * @param stripCwd Strip the current working directory, only reasonable for Node.js environment
 * @returns
 */
export function getSourceLocation(level = 2, stripCwd = true): string {
  let line: string | undefined
  let stack = new Error().stack
  if (typeof stack === "string") {
    line = stack
      ?.split("\n")
      ?.map((rawLine) => rawLine.match(/^\s+at.*\((.*?)\)/)?.[1])
      ?.filter((v) => v != null)?.[level]
    if (line && stripCwd && line.startsWith(process.cwd())) {
      line = line.substr(process.cwd().length + 1)
    }
  }
  return line || ""
}
