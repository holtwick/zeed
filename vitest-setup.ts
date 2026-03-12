// Required until node18
import * as crypto from 'node:crypto'

globalThis.crypto ??= crypto.webcrypto as unknown as Crypto

globalThis.isNodeTestEnv = true
