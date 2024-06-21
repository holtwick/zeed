import { readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { isHiddenPath } from './fs'
import { globToRegExp } from './glob'

interface StatsBase {
  isFile: () => boolean
  isDirectory: () => boolean
  isBlockDevice: () => boolean
  isCharacterDevice: () => boolean
  isSymbolicLink: () => boolean
  isFIFO: () => boolean
  isSocket: () => boolean
  dev: number
  ino: number
  mode: number
  nlink: number
  uid: number
  gid: number
  rdev: number
  size: number
  blksize: number
  blocks: number
  atimeMs: number
  mtimeMs: number
  ctimeMs: number
  birthtimeMs: number
  atime: Date
  mtime: Date
  ctime: Date
  birthtime: Date
}

/**
 * Retrieves the file system stats for the specified path asynchronously.
 * @param path - The path to the file or directory.
 * @returns A Promise that resolves to the file system stats (Stats) or undefined if an error occurs.
 */
export async function getStatAsync(path: string): Promise<StatsBase | undefined> {
  try {
    return await stat(path)
  }
  catch (err) { }
}

/**
 * Retrieves the fingerprint of a file asynchronously.
 * The fingerprint is a string representation of the file's path, modification time, and size.
 *
 * @param path - The path of the file.
 * @returns A promise that resolves to the fingerprint string, or undefined if the file does not exist.
 */
export async function getFingerprintAsync(path: string): Promise<string | undefined> {
  const stat = await getStatAsync(path)
  if (stat == null)
    return
  const { mtimeMs, size } = stat
  return `${path}|${mtimeMs}|${size}`
}

export async function walkSyncAsync(rootFolder: string, subFolder = '', ignoreHidden = true) {
  let resultPaths: string[] = []
  const paths = await readdir(resolve(rootFolder, subFolder))
  if (paths != null && paths.length > 0) {
    for (let file of paths) {
      file = join(subFolder, file)
      if (ignoreHidden && isHiddenPath(file))
        continue
      const realFile = join(rootFolder, file)
      const stat = await getStatAsync(realFile)
      if (stat && stat.isDirectory())
        resultPaths = resultPaths.concat(await walkSyncAsync(rootFolder, file) || [])
      else
        resultPaths.push(file)
    }
  }
  return resultPaths
}

export async function filesAsync(opt: {
  basePath?: string
  pattern?: string | RegExp
  filter?: (name: string) => boolean
  ignoreHidden?: boolean
} = {}) {
  let {
    pattern,
    filter,
    basePath = process.cwd(),
    ignoreHidden = false,
  } = opt

  let paths = await walkSyncAsync(basePath, '', ignoreHidden)

  paths = paths.filter(
    path =>
      !(ignoreHidden && (path.startsWith('.') || path.includes('/.'))),
  )

  if (pattern) {
    if (typeof pattern === 'string')
      pattern = globToRegExp(pattern)
    if (pattern instanceof RegExp) {
      const rx = pattern
      rx.lastIndex = 0
      paths = paths.filter(path => rx.test(path))
    }
  }

  if (filter)
    paths = paths.filter(filter)

  return paths
}

// export function glob(patterns: string[], opt: {
//   cwd?: string,
//   dot?: boolean
// })
