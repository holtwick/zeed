// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import type { LogMessage, LoggerInterface } from './log-base'
import { LoggerContext } from './log-context'

describe('logger', () => {
  it('should log different levels', () => {
    const messages: LogMessage[] = []

    const logger = LoggerContext()

    function LoggerTestHandler(msg: LogMessage) {
      messages.push(msg)
    }

    logger.setHandlers([LoggerTestHandler])

    const log: LoggerInterface = logger('test')

    log('Simple') // shortcut
    log.debug('Hello')
    log.info('World')
    log.warn('is on')
    log.error('Fire')

    try {
      log.assert(false, 'Fatal')
    }
    catch (err) { }

    expect(messages).toEqual([
      {
        level: 0,
        messages: ['Simple'],
        name: 'test',
      },
      {
        level: 0,
        messages: ['Hello'],
        name: 'test',
      },
      {
        level: 1,
        messages: ['World'],
        name: 'test',
      },
      {
        level: 2,
        messages: ['is on'],
        name: 'test',
      },
      {
        level: 3,
        messages: ['Fire'],
        name: 'test',
      },
      {
        level: 4,
        messages: ['Fatal'],
        name: 'test',
      },
    ])
  })

  it('should log filter level', () => {
    const messages: LogMessage[] = []
    function LoggerTestHandler(msg: LogMessage) {
      messages.push(msg)
    }

    const logger = LoggerContext()
    // logger.setLogLevel(LogLevel.info)
    logger.setHandlers([LoggerTestHandler])

    const log: LoggerInterface = logger('test')

    expect(log.label).toBe('test')

    log.debug('Hello')
    log.info('World')
    log.warn('is on')
    log.error('Fire')

    try {
      log.assert(false, 'Fatal')
    }
    catch (err) { }

    expect(messages).toEqual([
      { name: 'test', messages: ['Hello'], level: 0 }, // xxx
      { name: 'test', messages: ['World'], level: 1 },
      { name: 'test', messages: ['is on'], level: 2 },
      { name: 'test', messages: ['Fire'], level: 3 },
      { name: 'test', messages: ['Fatal'], level: 4 },
    ])

    {
      const log2: LoggerInterface = log.extend('ext')
      log2.debug('Hello')
      log2.info('World2')
      log2.warn('is on')
      log2.error('Fire')

      try {
        log2.assert(false, 'Fatal')
      }
      catch (err) { }

      // console.dir(messages)

      expect(messages).toEqual([
        { name: 'test', messages: ['Hello'], level: 0 }, // xxx
        { name: 'test', messages: ['World'], level: 1 },
        { name: 'test', messages: ['is on'], level: 2 },
        { name: 'test', messages: ['Fire'], level: 3 },
        { name: 'test', messages: ['Fatal'], level: 4 },
        { name: 'test:ext', messages: ['Hello'], level: 0 }, // xxx
        { name: 'test:ext', messages: ['World2'], level: 1 },
        { name: 'test:ext', messages: ['is on'], level: 2 },
        { name: 'test:ext', messages: ['Fire'], level: 3 },
        { name: 'test:ext', messages: ['Fatal'], level: 4 },
      ])
    }

    // logger.setLogLevel(LogLevel.all)
  })

  it('should log filter namespace', () => {
    const messages: LogMessage[] = []
    function LoggerTestHandler(msg: LogMessage) {
      messages.push(msg)
    }

    const logger = LoggerContext()
    logger.setHandlers([LoggerTestHandler])
    logger.setFilter('a*,-ab')

    const aa = logger('aa')
    const ab = logger('ab')
    const xy = logger('xy')

    aa('aa')
    ab('ab')
    xy('xy')

    expect(messages).toEqual([
      {
        level: 0,
        messages: ['aa'],
        name: 'aa',
      },
    ])

    // logger.setFilter("")
    const xyz = aa.extend('xyz')

    xyz('xyz')

    expect(messages).toEqual([
      {
        level: 0,
        messages: ['aa'],
        name: 'aa',
      },
      {
        level: 0,
        messages: ['xyz'],
        name: 'aa:xyz',
      },
    ])
  })

  it('should fake log', () => {
    const messages: LogMessage[] = []
    const logger = LoggerContext()

    function LoggerTestHandler(msg: LogMessage) {
      messages.push(msg)
    }

    logger.setHandlers([LoggerTestHandler])

    const log = logger('test', false)
    const { info, error, warn, debug, assert } = log

    log('Simple') // shortcut
    debug('Hello')
    info('World')
    warn('is on')
    error('Fire')

    expect(messages).toEqual([])
  })

  // it('should handle unreachable', () => {

  //   // https://github.com/microsoft/TypeScript/issues/50363#issuecomment-1219811447
  //   let log:LoggerInterface = Logger('xxx')

  //   function t1(data?: string): string {
  //     if (data == null)
  //       log.fatal('throw!')
  //     return data // Type 'string | undefined' is not assignable to type 'string'. Type 'undefined' is not assignable to type 'string'.(2322)
  //   }

  //   t1()
  // })
})
