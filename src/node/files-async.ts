import { readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { isHiddenPath } from './fs'
import { globToRegExp } from './glob'

export async function getStatAsync(path: string): Promise<any> {
  try {
    return await stat(path)
  }
  catch (err) { }
}

export async function getFingerprintAsync(path: string) {
  const { mtimeMs, size } = await getStatAsync(path) ?? {}
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
