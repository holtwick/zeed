// https://nodejs.org/api/webcrypto.html
import nodeCrypto from 'node:crypto'

export function setupWebCrypto() {
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
}

export async function getWebCrypto() {
  if (globalThis.crypto == null) {
    try {
      if (typeof globalThis !== 'undefined' && typeof globalThis.crypto === 'undefined') {
        // https://nodejs.org/api/webcrypto.html
        const nodeCrypto = await import('node:crypto')
        // @ts-expect-error this is a workaround for node environment
        globalThis.crypto = nodeCrypto.webcrypto
      }
    }
    catch (err) {
      console.warn('Failed to polyfill webcrypto', err)
    }
  }
  return globalThis.crypto
}

// declare namespace NodeJS {
//   interface Global {
//     crypto: Crypto
//   }
// }
