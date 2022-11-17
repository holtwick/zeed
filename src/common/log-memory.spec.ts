import type { LogMessage } from './log-base'
import { LogLevel, LoggerContext } from './log-base'
import { LoggerMemoryHandler } from './log-memory'

describe('log-memory', () => {
  it('should log into memory', async () => {
    const messages: LogMessage[] = []
    
    const logger = LoggerContext()    
    logger.setHandlers([
      LoggerMemoryHandler({
        level: LogLevel.all,
        filter: '*',
        messages,
      }),
    ])

    const log = logger('test')
    const { info, error, warn, debug, assert } = log

    log('Simple') // shortcut
    debug('Hello')
    info('World')
    warn('is on')
    error('Fire')
    assert(false, 'Fatal')

    expect(messages).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 1,
          "messages": Array [
            "World",
          ],
          "name": "test",
        },
        Object {
          "level": 2,
          "messages": Array [
            "is on",
          ],
          "name": "test",
        },
        Object {
          "level": 3,
          "messages": Array [
            "Fire",
          ],
          "name": "test",
        },
        Object {
          "level": 2,
          "messages": Array [
            "Fatal",
          ],
          "name": "test",
        },
      ]
    `)
  })
})
