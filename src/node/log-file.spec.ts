// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

/* eslint-disable n/no-path-concat */

import { rmSync, statSync, unlinkSync } from 'fs'
import { Logger, sleep, LogLevelAll } from '../common'
import { LoggerFileHandler } from './log-file'

describe('Log File', () => {
  afterAll(() => {
    rmSync(`${__dirname}/tmp`, { recursive: true, force: true })
  })

  it('should write log', async () => {
    const path = `${__dirname}/tmp/test.log`
    Logger.setHandlers([
      LoggerFileHandler(path, {
        level: LogLevelAll,
        filter: '*',
      }),
    ])
    const log = Logger('test')
    log('debug')
    log.info('info')
    log.warn('warn')
    log.error('error')
    await sleep(1000)
    expect(statSync(path).size).toBeGreaterThan(100)
    unlinkSync(path)
  })
})
