import { mkdir, rm, stat } from "node:fs/promises"
import { join as joinPath } from "node:path"

export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
  } catch (err) {
    return false
  }
  return true
}

export async function ensureFolder(...parts: string[]): Promise<string> {
  const path = joinPath(...parts)
  if (!(await exists(path))) {
    await mkdir(path, { recursive: true })
  }
  return path
}

export async function removeFolder(...parts: string[]): Promise<string> {
  const path = joinPath(...parts)
  if (await exists(path)) {
    await rm(path, { recursive: true })
  }
  return path
}
