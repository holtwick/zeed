import { Logger, LoggerConsoleHandler } from 'zeed'

if (import.meta.env?.MODE === 'production')
  Logger.setHandlers([LoggerConsoleHandler()])

const log2 = Logger('log2')
log2.info('test log2')
