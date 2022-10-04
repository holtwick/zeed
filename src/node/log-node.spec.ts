// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { LogLevel, Logger } from '../common'
import { LoggerNodeHandler, loggerStackTraceDebug } from './log-node'

describe('log-node', () => {
  it('should color log', async () => {
    Logger.setHandlers([LoggerNodeHandler()])
    const log = Logger('test')
    log('debug')
    log.info('info')
    log.warn('warn')
    log.info(loggerStackTraceDebug)
    log.error('error')
  })

  test('should find pattern', () => {
    Logger.setHandlers([
      LoggerNodeHandler({
        level: LogLevel.all,
        filter: '*',
        stack: true,
      }),
    ])
    const log = Logger('stack')
    log('debug')
    log.info('info')
    log.warn('warn')
    log.info(loggerStackTraceDebug)
    log.error('error')
  })
})
