// https://nodejs.org/api/webcrypto.html
import nodeCrypto from "crypto"

export {}

declare module NodeJS {
  interface Global {
    crypto: Crypto
  }
}

try {
  if (
    nodeCrypto &&
    nodeCrypto.webcrypto &&
    typeof globalThis !== "undefined" &&
    typeof globalThis.crypto === "undefined"
  ) {
    // @ts-ignore
    globalThis.crypto = nodeCrypto.webcrypto
  }
} catch (err) {
  console.warn("Failed to polyfill webcrypto", err)
}
