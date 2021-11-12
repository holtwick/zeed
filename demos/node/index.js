// Simple demo for node and CommonJS loading

import {
  Logger,
  setupEnv,
  stringToUInt8Array,
  digest,
  toUint8Array,
} from "zeed"

// Some basic logging

const log = Logger("demo")
log("Hello World")
log.info("Info")
log.warn("Warning")
log.error("Error")

// Read .env file

setupEnv()

log.info("DEMO_SECRET =", process.env.DEMO_SECRET)

// https://nodejs.org/api/webcrypto.html
import { webcrypto } from "crypto"

if (globalThis.crypto == null) {
  globalThis.crypto = webcrypto
}

;(async () => {
  log("encode", stringToUInt8Array("Hello Wörld"))
  log("digest", toUint8Array(await digest("Hello Wörld")))
})()
