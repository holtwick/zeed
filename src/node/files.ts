import { readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { isHiddenPath } from './fs'
import { globToRegExp } from './glob'

export function getStat(path: string) {
  try {
    return statSync(path)
  }
  catch (err) { }
}

export function getFingerprint(path: string) {
  const { mtimeMs, size } = getStat(path) ?? {}
  return `${path}|${mtimeMs}|${size}`
}

export function walkSync(rootFolder: string, subFolder = '', ignoreHidden = true) {
  let resultPaths: string[] = []
  const paths = readdirSync(resolve(rootFolder, subFolder))
  if (paths != null && paths.length > 0) {
    for (let file of paths) {
      file = join(subFolder, file)
      if (ignoreHidden && isHiddenPath(file))
        continue
      const realFile = join(rootFolder, file)
      const stat = getStat(realFile)
      if (stat && stat.isDirectory())
        resultPaths = resultPaths.concat(walkSync(rootFolder, file) || [])
      else
        resultPaths.push(file)
    }
  }
  return resultPaths
}

export function files(opt: {
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

  let paths = walkSync(basePath, '', ignoreHidden)

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
