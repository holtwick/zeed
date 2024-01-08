import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join as joinPath, normalize } from 'node:path'
import process from 'node:process'
import { isUint8Array } from '../common'

/** Try to use `~` for HOME folder if possible */
export function toHumanReadableFilePath(path: string) {
  const p = normalize(path)
  const h = process.env.HOME
  if (h && p.startsWith(h))
    return `~${p.slice(h.length)}`

  return p
}

export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
  }
  catch (err) {
    return false
  }
  return true
}

export function isHiddenPath(path: string): boolean {
  return path.startsWith('.') || path.includes('/.')
}

/** Create missing folders e.g. `/a/b/c` will create folders `/a/b/c` */
export async function ensureFolder(...parts: string[]): Promise<string> {
  const path = joinPath(...parts)
  if (!(await exists(path)))
    await mkdir(path, { recursive: true })
  return path
}

/** Create missing folder to file location e.g. `/a/b/c/s.txt` will create folders `/a/b/c` */
export async function ensureFolderForFile(...parts: string[]): Promise<string> {
  const path = dirname(joinPath(...parts))
  if (!(await exists(path)))
    await mkdir(path, { recursive: true })
  return path
}

export async function removeFolder(...parts: string[]): Promise<string> {
  const path = joinPath(...parts)
  if (await exists(path))
    await rm(path, { recursive: true })

  return path
}

export async function readText(...parts: string[]): Promise<string | undefined> {
  const path = joinPath(...parts)
  if (await exists(path))
    return await readFile(path, 'utf-8')
}

export async function writeText(path: string, content: string, createFolders = false): Promise<void> {
  if (createFolders)
    await ensureFolderForFile(path)
  await writeFile(path, content, 'utf-8')
}

export async function writeData(path: string, content: object | Uint8Array, createFolders = false): Promise<void> {
  if (createFolders)
    await ensureFolderForFile(path)
  const data = isUint8Array(content) ? content : JSON.stringify(content)
  await writeFile(path, data)
}

// todo: writeBinary, readBinary
