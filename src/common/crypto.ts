import { getGlobal } from "./platform"

export const crypto: Crypto = getGlobal().crypto || getGlobal()["msCrypto"]
export const getRandomValues = crypto?.["getRandomValues"]

export function randomUint8Array(length: number = 16): Uint8Array {
  let rands = new Uint8Array(length)
  if (getRandomValues) {
    getRandomValues(rands)
  } else {
    for (let i = 0; i < length; i++) {
      rands[i] = Math.floor(Math.random() * 256)
    }
  }
  return rands
}
