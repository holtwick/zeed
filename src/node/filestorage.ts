// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "fs"
import { dirname, resolve } from "path"
import { jsonStringifySafe } from "../common/data/json"
import { toValidFilename } from "../common/data/path"
import { cloneObject } from "../common/data/utils"
import { Logger } from "../common/log"
import { Json, ObjectStorage } from "../common/types"

const log = Logger("zeed:filestorage")

export interface FileStorageOptions {
  pretty?: boolean
  path?: string
  extension?: string
  objectFromString?: (data: string) => any
  objectToString?: (data: any) => string
  keyToFilename?: (key: string) => string
}

export class FileStorage<T = Json> implements ObjectStorage<T> {
  private store: Record<string, T | null> = {}
  private dirname: string
  private fileKeys?: string[] = undefined
  private pretty: boolean = false
  private extension: string
  private extensionLength: number
  private objectFromString: (data: string) => any
  private objectToString: (data: any) => string
  private keyToFilename: (key: string) => string

  constructor(opt: FileStorageOptions = {}) {
    this.dirname = resolve(process.cwd(), opt.path || ".fileStorage")
    this.pretty = !!opt.pretty
    this.extension = opt.extension || ".json"

    if (opt.extension && !this.extension.startsWith(".")) {
      this.extension = "." + this.extension
    }
    this.extensionLength = this.extension.length

    this.objectToString =
      opt.objectToString ||
      ((data: any): string => {
        return this.pretty
          ? jsonStringifySafe(data, null, 2)
          : jsonStringifySafe(data)
      })

    this.objectFromString =
      opt.objectFromString ||
      ((data: string) => {
        try {
          return JSON.parse(data)
        } catch (err) {
          log.warn(`fileStorage parse error '${err}' in`, data)
        }
      })

    this.keyToFilename = opt.keyToFilename || toValidFilename
  }

  setItem(key: string, value: T): void {
    this.store[key] = cloneObject(value)
    try {
      const data = this.objectToString(value)
      const path = this.getPath(key)
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, data, "utf8")
    } catch (err) {
      log.error("setItem error", err)
    }
  }

  getPath(key: string): string {
    return resolve(this.dirname, this.keyToFilename(key) + this.extension)
  }

  getBuffer(key: string): Buffer {
    const path = this.getPath(key)
    return Buffer.from(readFileSync(path))
  }

  getItem(key: string): T | undefined {
    let value = this.store[key]

    //  null is an indicator for not existing!
    if (value === null) return

    if (value != null) {
      return cloneObject(value) // this.objectFromString(value)
    }

    try {
      const path = this.getPath(key)
      const data = readFileSync(path, "utf8")
      if (data != null) {
        const value = this.objectFromString(data)
        this.store[key] = value
        return value
      }
    } catch (err) {
      // log.warn("getItem error", err)
      this.store[key] = null // do not retry next time
    }
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
      const path = this.getPath(key)
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
