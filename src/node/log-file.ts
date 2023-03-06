// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { createWriteStream, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { renderMessages } from '../common/data/convert'
import type { LogHandlerOptions, LogMessage } from '../common/log-base'
import { LogLevelError, LogLevelInfo, LogLevelWarn } from '../common/log-base'
import { useLevelFilter, useNamespaceFilter } from '../common/log-filter'

const namespaces: Record<string, any> = {}

export function LoggerFileHandler(path: string, opt: LogHandlerOptions = {}) {
  const {
    level = undefined,
    filter = undefined,
    time = true,
    pretty = false,
  } = opt
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

    const timeNow = time ? `${new Date().toISOString()} ` : ''
    const name = msg.name || ''
    const ninfo = namespaces[name || '']
    if (ninfo == null)
      namespaces[name] = ninfo

    const args: string[] = [
      `[${name || '*'}]`,
      renderMessages(msg.messages, { pretty }),
    ]

    function write(...args: string[]): void {
      stream.write(`${args.join('\t')}\n`)
    }

    switch (msg.level) {
      case LogLevelInfo:
        write(`${timeNow}I|*  `, ...args)
        break
      case LogLevelWarn:
        write(`${timeNow}W|** `, ...args)
        break
      case LogLevelError:
        write(`${timeNow}E|***`, ...args)
        break
      default:
        write(`${timeNow}D|   `, ...args)
        break
    }
  }
}
