import { Json } from "../common/types.js"
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  unlinkSync,
  readdirSync,
} from "fs"
import { resolve } from "path"

export class FileStorage {
  private store: { [key: string]: string } = {}
  private dirname: string
  private fileKeys?: string[] = undefined

  constructor(basePath?: string) {
    this.dirname = resolve(process.cwd(), basePath || ".fileStorage")
  }

  setItem(key: string, value: Json): void {
    const data = JSON.stringify(value)
    this.store[key] = data
    try {
      const path = resolve(this.dirname, key + ".json")
      mkdirSync(this.dirname, { recursive: true })
      writeFileSync(path, data, "utf8")
    } catch (err) {
      console.error("setItem error", err)
    }
  }

  getItem(key: string): Json | null {
    if (this.store.hasOwnProperty(key)) {
      let value = this.store[key]
      return JSON.parse(value) || null
    } else {
      try {
        const path = resolve(this.dirname, key + ".json")
        const data = readFileSync(path, "utf8")
        if (data) {
          return JSON.parse(data)
        }
      } catch (err) {
        console.error("getItem error", err)
      }
    }
    return null
  }

  removeItem(key: string): void {
    delete this.store[key]
    if (this.fileKeys != null) {
      const index: number = this.fileKeys.indexOf(key)
      if (index !== -1) {
        this.fileKeys.splice(index, 1)
      }
    }
    try {
      const path = resolve(this.dirname, key + ".json")
      unlinkSync(path)
    } catch (err) {}
  }

  clear(): void {
    this.fileKeys = []
    this.store = {}
    rmSync(this.dirname, { recursive: true, force: true })
  }

  allKeys(): string[] {
    if (this.fileKeys == null) {
      try {
        this.fileKeys =
          readdirSync(this.dirname, { withFileTypes: true })
            .filter(
              (item) => !item.isDirectory() && item.name.endsWith(".json")
            )
            .map((item) => item.name.slice(0, -5)) || []
      } catch (err) {}
    }
    let keys = [...(this.fileKeys || [])]
    for (let key of Object.keys(this.store)) {
      if (!keys.includes(key)) {
        keys.push(key)
      }
    }
    keys.sort()
    return keys
  }
}
