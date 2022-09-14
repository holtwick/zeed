// @ts-ignore
globalThis.isNodeTestEnv = true

class File extends Blob {
  name: string
  constructor(a: any, name: string) {
    super(a)
    this.name = name
  }
}

// @ts-ignore
globalThis.File = File

// @ts-ignore
globalThis.FILE_OBSERVER = false

// // @ts-ignore
// globalThis.localStorage = new MemStorage()

// // @ts-ignore
// globalThis.navigator = { language: "en", userAgent: "" }

// // @ts-ignore
// globalThis.navigator = { language: "en", userAgent: "" }

import { webcrypto } from "crypto"

if (globalThis.crypto == null) {
  // @ts-ignore
  globalThis.crypto = webcrypto
}
