/* eslint-disable node/no-path-concat */

import { rmSync, statSync, unlinkSync } from 'node:fs'
import { sleep } from '../../common/exec/promise'
import { DefaultLogger, getGlobalLogger, LogLevelAll } from '../../common/log'
import { LoggerFileHandler } from './log-file'

describe('log File', () => {
  afterAll(() => {
    rmSync(`${__dirname}/tmp`, { recursive: true, force: true })
  })

  it('should write log', async () => {
    const path = `${__dirname}/tmp/test.log`
    getGlobalLogger().setHandlers([
      LoggerFileHandler(path, {
        level: LogLevelAll,
        filter: '*',
      }),
    ])
    const log = DefaultLogger('test')
    log('debug')
    log.info('info')
    log.warn('warn')
    log.error('error')
    await sleep(1000)
    expect(statSync(path).size).toBeGreaterThan(100)
    unlinkSync(path)
  })

  it('should use rotation when rotation options are provided', async () => {
    const path = `${__dirname}/tmp/rotated.log`
    getGlobalLogger().setHandlers([
      LoggerFileHandler(path, {
        level: LogLevelAll,
        filter: '*',
        rotation: {
          size: '1K', // Rotate when file reaches 1KB
          maxFiles: 3,
        },
      }),
    ])
    const log = DefaultLogger('test-rotation')

    // Write enough logs to trigger rotation
    for (let i = 0; i < 50; i++) {
      log.info(`This is log message number ${i} with some extra text to make it longer`)
    }

    await sleep(1000)

    // Check that the main log file exists
    expect(statSync(path).size).toBeGreaterThan(0)

    // Clean up rotated files
    const files = [
      path,
      `${path}.1`,
      `${path}.2`,
      `${path}.3`,
    ]
    files.forEach((file) => {
      try {
        unlinkSync(file)
      }
      catch (e) {
        // File might not exist, ignore
      }
    })
  })

  it('should use default rotation settings when rotation is true', async () => {
    const path = `${__dirname}/tmp/default-rotated.log`
    getGlobalLogger().setHandlers([
      LoggerFileHandler(path, {
        level: LogLevelAll,
        filter: '*',
        rotation: true, // Use default settings
      }),
    ])
    const log = DefaultLogger('test-default-rotation')

    // Write enough logs to trigger rotation (default is 10MB, so this won't trigger)
    for (let i = 0; i < 10; i++) {
      log.info(`This is a test message ${i}`)
    }

    await sleep(1000)

    // Check that the main log file exists
    expect(statSync(path).size).toBeGreaterThan(0)

    // Clean up
    try {
      unlinkSync(path)
    }
    catch (e) {
      // File might not exist, ignore
    }
  })
})
