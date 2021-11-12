// https://nodejs.org/api/webcrypto.html
import { webcrypto } from "crypto"

export {}

declare module NodeJS {
  interface Global {
    crypto: Crypto
  }
}

try {
  // const { webcrypto } = require("crypto")

  if (
    webcrypto &&
    typeof globalThis !== "undefined" &&
    typeof globalThis.crypto === "undefined"
  ) {
    // @ts-ignore
    globalThis.crypto = webcrypto
  }
} catch (err) {
  console.warn("Failed to polyfill webcrypto", err)
}
