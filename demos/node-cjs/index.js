// Simple demo for node and CommonJS loading

import process from 'node:process'

const {
  Logger,
  setupEnv,
  stringToUInt8Array,
  digest,
  toUint8Array,
  uuid,
} = require('zeed')

// Some basic logging

const log = Logger('demo')
log('Hello World')
log.info('Info')
log.warn('Warning')
log.error('Error')

// Read .env file

setupEnv()

log.info('DEMO_SECRET =', process.env.DEMO_SECRET)

log.info('DEMO_SECRET =', process.env.DEMO_SECRET)
;(async () => {
  log('uuid', uuid())
  log('encode', stringToUInt8Array('Hello Wörld'))
  log('digest', toUint8Array(await digest('Hello Wörld')))
})()
