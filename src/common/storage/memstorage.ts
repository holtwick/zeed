// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Json } from "../types"
import { Logger } from "../log"
import { ObjectStorage } from "../types"
import { cloneObject } from "../data/utils"

const log = Logger("zeed:memstorage")

export interface MemStorageOptions {
  objectFromString?: (data: string) => any
  objectToString?: (data: any) => string
}

export class MemStorage<T = Json> implements ObjectStorage<T> {
  private store: Record<string, T> = {}
  // private pretty: boolean = false
  // private objectFromString: (data: string) => any
  // private objectToString: (data: any) => string

  constructor(opt: MemStorageOptions = {}) {
    // this.objectToString =
    //   opt.objectToString ??
    //   ((data: any): string => {
    //     return this.pretty
    //       ? JSON.stringify(data, null, 2)
    //       : JSON.stringify(data)
    //   })
    // this.objectFromString =
    //   opt.objectFromString ??
    //   ((data: string) => {
    //     try {
    //       return JSON.parse(data)
    //     } catch (err) {
    //       log.warn(`MemStorage parse error '${err}' in`, data)
    //     }
    //   })
  }

  setItem(key: string, value: T): void {
    // const data = this.objectToString(value)
    this.store[key] = cloneObject(value)
  }

  getItem(key: string): T | undefined {
    if (this.store.hasOwnProperty(key)) {
      return cloneObject(this.store[key])
    }
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }

  allKeys(): string[] {
    return Object.keys(this.store)
  }
}
