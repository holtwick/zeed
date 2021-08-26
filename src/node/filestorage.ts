// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Json } from "../common/types"
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  unlinkSync,
  readdirSync,
} from "fs"
import { resolve } from "path"
import { Logger } from "../common/log"

const log = Logger("zeed:filestorage")

export interface FileStorageOptions {
  pretty?: boolean
  path?: string
  extension?: string
  objectFromString?: (data: string) => any
  objectToString?: (data: any) => string
}

export class FileStorage {
  private store: { [key: string]: string } = {}
  private dirname: string
  private fileKeys?: string[] = undefined
  private pretty: boolean = false
  private extension: string
  private extensionLength: number
  private objectFromString: (data: string) => any
  private objectToString: (data: any) => string

  constructor(opt: FileStorageOptions = {}) {
    this.dirname = resolve(process.cwd(), opt.path || ".fileStorage")
    this.pretty = !!opt.pretty
    this.extension = opt.extension ?? ".json"

    if (!this.extension.startsWith(".")) this.extension = "." + this.extension
    this.extensionLength = this.extension.length

    this.objectToString =
      opt.objectToString ??
      ((data: any): string => {
        return this.pretty
          ? JSON.stringify(data, null, 2)
          : JSON.stringify(data)
      })

    this.objectFromString =
      opt.objectFromString ??
      ((data: string) => {
        try {
          return JSON.parse(data)
        } catch (err) {
          log.warn(`fileStorage parse error '${err}' in`, data)
        }
      })
  }

  setItem(key: string, value: Json): void {
    const data = this.objectToString(value)
    this.store[key] = data
    try {
      const path = resolve(this.dirname, key + this.extension)
      mkdirSync(this.dirname, { recursive: true })
      writeFileSync(path, data, "utf8")
    } catch (err) {
      log.error("setItem error", err)
    }
  }

  getPath(key: string): string {
    return resolve(this.dirname, key + this.extension)
  }

  getBuffer(key: string): Buffer {
    const path = resolve(this.dirname, key + this.extension)
    return Buffer.from(readFileSync(path))
  }

  getItem(key: string): Json | null {
    if (this.store.hasOwnProperty(key)) {
      let value = this.store[key]
      return this.objectFromString(value) || null
    } else {
      try {
        const path = resolve(this.dirname, key + this.extension)
        const data = readFileSync(path, "utf8")
        if (data) {
          return this.objectFromString(data)
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
      const path = resolve(this.dirname, key + this.extension)
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
              (item) =>
                !item.isDirectory() && item.name.endsWith(this.extension)
            )
            .map((item) => item.name.slice(0, -this.extensionLength)) || []
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
