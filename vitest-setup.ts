// Required until node18
import * as crypto from 'node:crypto'

if (globalThis.crypto == null) {
  // @ts-expect-error Workaround
  globalThis.crypto = crypto.webcrypto
}

globalThis.isNodeTestEnv = true
