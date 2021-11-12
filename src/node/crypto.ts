// https://nodejs.org/api/webcrypto.html
import { webcrypto } from "crypto"

declare module NodeJS {
  interface Global {
    crypto: typeof webcrypto
  }
}

try {
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.crypto === "undefined"
  ) {
    // @ts-ignore
    globalThis.crypto = webcrypto
  }
} catch (err) {
  console.warn("Failed to polyfill webcrypto")
}
