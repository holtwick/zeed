// @ts-ignore
globalThis.isNodeTestEnv = true

import { webcrypto } from "crypto"

if (globalThis.crypto == null) {
  // @ts-ignore
  globalThis.crypto = webcrypto
}
