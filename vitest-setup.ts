import * as crypto from 'node:crypto'

globalThis.isNodeTestEnv = true

if (globalThis.crypto == null) {
  // @ts-expect-error Workaround
  globalThis.crypto = crypto.webcrypto
}
