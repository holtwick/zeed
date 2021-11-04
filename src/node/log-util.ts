// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { resolve } from "path"

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

const cwd = resolve(process.cwd())
const home = process.env?.HOME ? resolve(process.env?.HOME) : ""
// console.log(`cwd = ${cwd}, home = ${home}}`)

function pathStripCwd(path: string) {
  // console.log(">", path)

  if (path.includes("/node_modules/")) {
    return ""
  }

  const fileURL = "file://"
  if (path.startsWith(fileURL)) {
    return path.substr(fileURL.length)
  }

  if (cwd && path.startsWith(cwd)) {
    return path.substr(cwd.length + 1)
  }

  if (home && path.startsWith(home)) {
    path = "~/" + path.substr(home.length + 1)
  }

  return path
}

function extractFileInfo(stackLine: string): string {
  let m = stackLine.match(/^\s*at.*(\((.*)\)|file:\/\/(.*)$)/)
  if (m) {
    let line = m[3] || m[2]
    if (line.endsWith(")")) line = line.slice(0, -1)
    return line
  }
  return ""
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
    line = pathStripCwd(line)
  }
  return line || ""
}

export function getStack(): string {
  return new Error().stack || ""
}

export function getSourceLocationByPrecedingPattern(
  patterns: string[],
  stripCwd = true
) {
  let line = ""
  let stack = new Error().stack || ""
  if (typeof stack === "string") {
    const lines = stack.split("\n").map((l) => l.trim())
    // console.log(lines)
    const index = lines.findIndex((l) => patterns.some((p) => l.startsWith(p)))
    line = lines[index + 1]
    if (line) {
      line = extractFileInfo(line)
    }
    if (line && stripCwd) {
      line = pathStripCwd(line)
    }
  }
  return line
}
