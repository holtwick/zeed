import { LoggerInterface, LogLevelAll, LogMessage } from './log-base'
import { LoggerContext } from './log-context'
import { LoggerMemoryHandler } from './log-memory'

describe('log-memory', () => {
  it('should log into memory', async () => {
    const messages: LogMessage[] = []

    const logger = LoggerContext()
    logger.setHandlers([
      LoggerMemoryHandler({
        level: LogLevelAll,
        filter: '*',
        messages,
      }),
    ])

    const log: LoggerInterface = logger('test')

    log('Simple') // shortcut
    log.debug('Hello')
    log.info('World')
    log.warn('is on')
    log.error('Fire')

    try {
      log.assert(false, 'Fatal')
    } catch (err) { }

    expect(messages.map(msg => {
      delete msg.timestamp
      return msg
    })).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 0,
          "messages": Array [
            "Simple",
          ],
          "name": "test",
        },
        Object {
          "level": 0,
          "messages": Array [
            "Hello",
          ],
          "name": "test",
        },
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
          "level": 4,
          "messages": Array [
            "Fatal",
          ],
          "name": "test",
        },
      ]
    `)
  })
})
