// https://nodejs.org/api/webcrypto.html
import nodeCrypto from 'node:crypto'

export {}

// declare namespace NodeJS {
//   interface Global {
//     crypto: Crypto
//   }
// }

// todo sideeffects
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

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// declare namespace NodeJS {
//   interface Global {
//     crypto: Crypto
//   }
// }

// export async function getCrypto() {
//   if (!globalThis.crypto) {
//     try {
//       if (typeof globalThis !== 'undefined' && typeof globalThis.crypto === 'undefined') {
//         // https://nodejs.org/api/webcrypto.html
//         // @ts-expect-error this is a workaround for node environment
//         globalThis.crypto = await import('crypto')
//       }
//     }
//     catch (err) {
//       console.warn('Failed to polyfill webcrypto', err)
//     }
//   }
//   return globalThis.crypto
// }
