import type { LogHandlerOptions, LogMessage } from '../../common/log/log-base'
import type { Options as RotationOptions } from './log-rotation'
import { createWriteStream, mkdirSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import process from 'node:process'
import { renderMessages } from '../../common/data/message'
import { LogLevelError, LogLevelInfo, LogLevelWarn } from '../../common/log/log-base'
import { useLevelFilter, useNamespaceFilter } from '../../common/log/log-filter'
import { createStream } from './log-rotation'

interface LogFileHandlerOptions extends LogHandlerOptions {
  /**
   * Optional rotation options for log files. When provided, enables automatic log rotation.
   * Can be:
   * - `true`: Use default rotation settings (10MB size, 5 files, gzip compression)
   * - Rotation options object: Customize rotation behavior
   *
   * Examples:
   * - Enable with defaults: { rotation: true }
   * - Rotate daily: { rotation: { interval: '1d' } }
   * - Rotate when file reaches 10MB: { rotation: { size: '10M' } }
   * - Keep max 5 files: { rotation: { maxFiles: 5 } }
   * - Compress rotated files: { rotation: { compress: 'gzip' } }
   */
  rotation?: boolean | RotationOptions
}

const namespaces: Record<string, any> = {}

function getRotationOptions(rotation: boolean | RotationOptions | undefined): RotationOptions | undefined {
  if (!rotation)
    return undefined
  if (rotation === true) {
    return {
      size: '10M',
      maxFiles: 5,
      compress: 'gzip',
    }
  }
  return rotation
}

export function LoggerFileHandler(path: string, opt: LogFileHandlerOptions = {}) {
  const {
    level = undefined,
    filter = undefined,
    time = true,
    pretty = false,
    rotation,
  } = opt

  path = resolve(process.cwd(), path)
  const pathFolder = dirname(path)
  mkdirSync(pathFolder, { recursive: true })

  // Use rotating stream if rotation options are provided
  const rotationOpts = getRotationOptions(rotation)

  let stream: ReturnType<typeof createWriteStream> | ReturnType<typeof createStream>
  if (rotationOpts) {
    rotationOpts.path = pathFolder
    stream = createStream(basename(path), rotationOpts)
  }
  else {
    stream = createWriteStream(path, { flags: 'a' })
  }

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
