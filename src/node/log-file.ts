// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { createWriteStream, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { renderMessages } from '../common/data/convert'
import type { LogHandlerOptions, LogMessage } from '../common/log-base'
import { LogLevel } from '../common/log-base'
import { useLevelFilter, useNamespaceFilter } from '../common/log-filter'

const namespaces: Record<string, any> = {}

export function LoggerFileHandler(path: string, opt: LogHandlerOptions = {}) {
  const { level = undefined, filter = undefined } = opt
  path = resolve(process.cwd(), path)
  mkdirSync(dirname(path), { recursive: true })
  const stream = createWriteStream(path, { flags: 'a' })
  const matchesNamespace = useNamespaceFilter(filter)
  const matchesLevel = useLevelFilter(level)
  return (msg: LogMessage) => {
    if (!matchesLevel(msg.level))
      return
    if (!matchesNamespace(msg.name))
      return

    const timeNow = new Date().toISOString()
    const name = msg.name || ''
    const ninfo = namespaces[name || '']
    if (ninfo == null)
      namespaces[name] = ninfo

    const args: string[] = [
      `[${name || '*'}]`,
      renderMessages(msg.messages, { pretty: false }),
    ]

    function write(...args: string[]): void {
      stream.write(`${args.join('\t')}\n`)
    }

    switch (msg.level) {
      case LogLevel.info:
        write(timeNow, 'I|*  ', ...args)
        break
      case LogLevel.warn:
        write(timeNow, 'W|** ', ...args)
        break
      case LogLevel.error:
        write(timeNow, 'E|***', ...args)
        break
      default:
        write(timeNow, 'D|   ', ...args)
        break
    }
  }
}
