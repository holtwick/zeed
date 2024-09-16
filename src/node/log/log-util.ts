import { resolve } from 'node:path'
import process from 'node:process'
import { isNotNull } from '../../common/data/is'

export function getStackLlocationList(stack: string): string[] {
  if (typeof stack !== 'string')
    return []
  // console.log("stack", stack)
  return (
    stack?.split('\n').map((rawLine) => {
      const m = rawLine.match(
        // eslint-disable-next-line regexp/no-super-linear-backtracking
        /^\s+at.*(\((.*)\)|file:\/\/(.*)$)|\s*at\s(\/.*)$/,
      )
      if (m) {
        let line = m[3] || m[2] || m[4]
        if (line.endsWith(')'))
          line = line.slice(0, -1)
        return line
      }
      return undefined
    })?.filter(isNotNull) ?? []
  )
}

function pathStripCwd(path: string) {
  if (path.includes('/node_modules/'))
    return ''

  const fileURL = 'file://'
  if (path.startsWith(fileURL))
    return path.substr(fileURL.length)

  const cwd = resolve(process.cwd())
  if (cwd && path.startsWith(cwd))
    return path.substr(cwd.length + 1)

  const home = process.env?.HOME ? resolve(process.env?.HOME) : ''
  if (home && path.startsWith(home))
    path = `~/${path.substr(home.length + 1)}`

  return path
}

function extractFileInfo(stackLine: string): string {
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  const m = stackLine.match(/^\s*at.*(\((.*)\)|file:\/\/(.*)$)|\s*at\s(\/.*)$/)
  if (m) {
    let line = m[3] || m[2] || m[4]
    if (line.endsWith(')'))
      line = line.slice(0, -1)
    return line
  }
  return ''
}

/**
 * Get the source code location of the caller
 * https://stackoverflow.com/a/47296370/140927
 *
 * @param level Number of levels to go down the stack trace
 * @param stripCwd Strip the current working directory, only reasonable for Node.js environment
 */
export function getSourceLocation(level = 2, stripCwd = true): string {
  const stack = new Error('stack').stack || ''
  let line: string | undefined = getStackLlocationList(stack)?.[level]
  if (line && stripCwd)
    line = pathStripCwd(line)

  return line || ''
}

export function getStack(): string {
  return new Error('stack').stack || ''
}

export function getSourceLocationByPrecedingPattern(
  patterns: string[],
  stripCwd = true,
) {
  let line = ''
  const stack = new Error('stack').stack || ''
  if (typeof stack === 'string') {
    const lines = stack.split('\n').map(l => l.trim())
    // console.log(lines)
    const index = lines.findIndex(l => patterns.some(p => l.startsWith(p)))
    line = lines[index + 1]
    if (line)
      line = extractFileInfo(line)

    if (line && stripCwd)
      line = pathStripCwd(line)
  }
  return line
}
