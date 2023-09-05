// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { getGlobalLogger, DefaultLogger, LogLevelAll } from '../../common/log'
import { LoggerNodeHandler, loggerStackTraceDebug } from './log-node'

describe('log-node', () => {
  it('should color log', async () => {
    getGlobalLogger().setHandlers([LoggerNodeHandler()])
    const log = DefaultLogger('test')
    log('debug')
    log.info('info')
    log.warn('warn')
    log.info(loggerStackTraceDebug)
    log.error('error')
  })

  test('should find pattern', () => {
    getGlobalLogger().setHandlers([
      LoggerNodeHandler({
        level: LogLevelAll,
        filter: '*',
        stack: true,
      }),
    ])
    const log = DefaultLogger('stack')
    log('debug')
    log.info('info')
    log.warn('warn')
    log.info(loggerStackTraceDebug)
    log.error('error')
  })
})
