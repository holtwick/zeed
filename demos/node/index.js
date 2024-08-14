// Simple demo for node and CommonJS loading

import process from 'node:process'

import { Logger, digest, setupEnv, stringToUInt8Array, toUint8Array, uuid } from 'zeed'

// Some basic logging

const log = Logger('demo')
log('Hello World')
log.info('Info')
log.warn('Warning')
log.error('Error')

// Read .env file

setupEnv()

log.info('DEMO_SECRET =', process.env.DEMO_SECRET)
;(async () => {
  log('uuid', uuid())
  log('encode', stringToUInt8Array('Hello Wörld').byteLength)
  log('digest', toUint8Array(await digest('Hello Wörld')).byteLength)
})()
