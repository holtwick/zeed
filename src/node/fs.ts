import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join as joinPath, normalize } from 'node:path'

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

export async function ensureFolder(...parts: string[]): Promise<string> {
  const path = joinPath(...parts)
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

export async function readText(
  ...parts: string[]
): Promise<string | undefined> {
  const path = joinPath(...parts)
  if (await exists(path))
    return await readFile(path, 'utf-8')
}

export async function writeText(path: string, content: string): Promise<void> {
  await writeFile(path, content, 'utf-8')
}

// todo: writeBinary, readBinary
