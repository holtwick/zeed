import { BinInput, toUint8Array } from "./data/bin"

/* 

// Web Crypto polyfill for node 15+:
// https://nodejs.org/api/webcrypto.html

import { webcrypto } from "crypto"

if (globalThis.crypto == null) {
  globalThis.crypto = webcrypto
}
*/

// todo: should fallback to node crypto
export function randomUint8Array(length: number = 16): Uint8Array {
  let randomBytes = new Uint8Array(length)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes)
  } else {
    for (let i = 0; i < length; i++) {
      // Math.random: "...range 0 to less than 1 (inclusive of 0, but not 1)"
      // 0.9... * 0xff < 255 therefore * 0x100
      randomBytes[i] = Math.floor(Math.random() * 0x100) // 0...255
    }
  }
  return randomBytes
}

export async function digest(
  message: BinInput,
  algorithm: AlgorithmIdentifier = "SHA-256"
): Promise<ArrayBuffer> {
  return await crypto.subtle.digest(algorithm, toUint8Array(message))
}

export async function deriveKeyPbkdf2(
  secret: BinInput,
  opt: {
    iterations?: number
    salt?: BinInput
  } = {}
): Promise<CryptoKey> {
  const secretBuffer = toUint8Array(secret)
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    secretBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  )
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toUint8Array(opt.salt ?? ""),
      iterations: opt.iterations ?? 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  )
}
