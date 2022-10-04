// https://nodejs.org/api/webcrypto.html
import nodeCrypto from 'crypto'

export {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace NodeJS {
  interface Global {
    crypto: Crypto
  }
}

// todo sideffects
try {
  if (
    typeof globalThis !== 'undefined'
    && typeof globalThis.crypto === 'undefined'
    && nodeCrypto
    && nodeCrypto.webcrypto
  ) {
    // @ts-expect-error this is a workaround for node environment
    globalThis.crypto = nodeCrypto.webcrypto
  }
}
catch (err) {
  console.warn('Failed to polyfill webcrypto', err)
}
