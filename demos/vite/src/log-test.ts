/* eslint-disable no-console */
import type { LogMessage } from '../../../src/common'
import { getGlobalLogger, logCaptureConsole, LoggerMemoryHandler, LogLevelAll } from '../../../src/common'
import { Logger } from '../../../src/index.browser'

export function logTest() {
  const messages: LogMessage[] = []

  getGlobalLogger().registerHandler(LoggerMemoryHandler({
    level: LogLevelAll,
    filter: '*',
    messages,
  }))

  logCaptureConsole(Logger('console'))

  {
    const log = Logger('demo')
    log('Hello World')
    log.info('Info')
    log.warn('Warning')
    log.error('Error')
  }

  {
    const log = Logger('demo2')
    log('Hello World')
    log.info('Info')
    log.warn('Warning')
    log.error('Error')

    log('Some binary data', new Uint8Array([1, 2, 3, 99, 100, 101]))
  }

  console.log('Hello World')
  console.info('Info')
  console.warn('Warning')
  console.error('Error')
}
