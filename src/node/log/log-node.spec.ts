import { DefaultLogger, LogLevelAll, getGlobalLogger } from '../../common/log'
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

  it('should find pattern', () => {
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
