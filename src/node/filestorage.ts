// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

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
import { Logger } from "../common/log.js"

const log = Logger("zeed:filestorage")

export interface FileStorageOptions {
  pretty?: boolean
  path?: string
}

export class FileStorage {
  private store: { [key: string]: string } = {}
  private dirname: string
  private fileKeys?: string[] = undefined
  private pretty: boolean = false

  constructor(opt: FileStorageOptions = {}) {
    this.dirname = resolve(process.cwd(), opt.path || ".fileStorage")
    this.pretty = opt.pretty ?? false
  }

  setItem(key: string, value: Json): void {
    const data = this.pretty
      ? JSON.stringify(value, null, 2)
      : JSON.stringify(value)
    this.store[key] = data
    try {
      const path = resolve(this.dirname, key + ".json")
      mkdirSync(this.dirname, { recursive: true })
      writeFileSync(path, data, "utf8")
    } catch (err) {
      log.error("setItem error", err)
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
        log.error("getItem error", err)
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
