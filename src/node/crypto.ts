// https://nodejs.org/api/webcrypto.html
import nodeCrypto from "crypto"

export {}

declare module NodeJS {
  interface Global {
    crypto: Crypto
  }
}

// todo sideffects
try {
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.crypto === "undefined" &&
    nodeCrypto &&
    nodeCrypto.webcrypto
  ) {
    // @ts-ignore
    globalThis.crypto = nodeCrypto.webcrypto
  }
} catch (err) {
  console.warn("Failed to polyfill webcrypto", err)
}
