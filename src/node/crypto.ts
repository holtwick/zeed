// https://nodejs.org/api/webcrypto.html
import { webcrypto } from "crypto"

declare module NodeJS {
  interface Global {
    crypto: typeof webcrypto
  }
}

if (
  typeof globalThis !== "undefined" &&
  typeof globalThis.crypto === "undefined"
) {
  console.log("polyfill")
  // @ts-ignore
  globalThis.crypto = webcrypto
}
