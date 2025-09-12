import type { Type } from '../../common/schema'
import type { RotationOptions } from './log-rotation'
import { valueToBoolean } from '../../common/data/convert'
import { z } from '../../common/schema'

export type LogRotationOptions = boolean | RotationOptions | 'daily' | 'weekly' | 'monthly' | 'size'

export function parseLogRotationConfigEnv(v?: string | null): LogRotationOptions {
  if (['daily', 'weekly', 'monthly', 'size'].includes(String(v).trim().toLowerCase())) {
    return v as 'daily' | 'weekly' | 'monthly' | 'size'
  }

  return valueToBoolean(v, false)
}

export function getLogRotationConfig(rotation: LogRotationOptions | undefined): RotationOptions | undefined {
  if (!rotation)
    return undefined

  // default for true and explicit 'size' is size-based rotation
  if (rotation === true || rotation === 'size') {
    return { size: '10M', maxFiles: 5, compress: 'gzip' }
  }

  // time-based shortcuts -> map to interval + maxFiles
  if (rotation === 'daily')
    return { interval: '1d', maxFiles: 30, compress: 'gzip' }
  if (rotation === 'weekly')
    return { interval: '7d', maxFiles: 30, compress: 'gzip' }
  if (rotation === 'monthly')
    return { interval: '1M', maxFiles: 90, compress: 'gzip' }

  // assume it's a full RotationOptions object
  return rotation as RotationOptions
}

export function getLogFileRotationConfigSchemaOptions(simple = false): Type[] {
  const options: Type[] = [
    z.boolean(),
    z.literal('daily'),
    z.literal('weekly'),
    z.literal('monthly'),
    z.literal('size'),
  ]

  if (!simple) {
    options.push(z.object({
      compress: z.union([z.boolean(), z.literal('gzip')]).optional(),
      encoding: z.string().optional(),
      history: z.string().optional(),
      immutable: z.boolean().optional(),
      initialRotation: z.boolean().optional(),
      interval: z.string().optional(),
      intervalBoundary: z.boolean().optional(),
      intervalUTC: z.boolean().optional(),
      maxFiles: z.number().optional(),
      maxSize: z.string().optional(),
      mode: z.number().optional(),
      omitExtension: z.boolean().optional(),
      path: z.string().optional(),
      rotate: z.number().optional(),
      size: z.string().optional(),
      teeToStdout: z.boolean().optional(),
    }))
  }

  return options
}
