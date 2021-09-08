// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Json, ObjectStorage } from "../common/types"
import { Logger } from "../common/log"

const log = Logger("zeed:localstorage")

export interface LocalStorageOptions {
  name: string
  objectFromString?: (data: string) => any
  objectToString?: (data: any) => string
}

export class LocalStorage {
  private name: string
  private prefix: string
  private pretty: boolean = false
  private objectFromString: (data: string) => any
  private objectToString: (data: any) => string

  constructor(opt: LocalStorageOptions) {
    log.assert(opt.name, "name required")
    this.name = opt.name
    this.prefix = `${opt.name}$`
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
          log.warn(`LocalStorage parse error '${err}' in`, data)
        }
      })
  }

  setItem(key: string, value: Json): void {
    const data = this.objectToString(value)
    localStorage.setItem(`${this.prefix}${key}`, data)
  }

  getItem(key: string): Json | undefined {
    let value = localStorage.getItem(`${this.prefix}${key}`)
    if (value != null) {
      return this.objectFromString(value)
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(`${this.prefix}${key}`)
  }

  clear(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .forEach((key) => {
        localStorage.removeItem(key)
      })
  }

  allKeys(): string[] {
    const prefixLength = this.prefix.length
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.substr(prefixLength))
  }
}
