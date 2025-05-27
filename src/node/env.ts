// Adopted from https://github.com/motdotla/dotenv BSD-2

import fs from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const NEWLINE = '\n'
// eslint-disable-next-line regexp/no-super-linear-backtracking
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)\s*$/
const RE_NEWLINES = /\\n/g
const NEWLINES_MATCH = /\r\n|\n|\r/

interface EnvOptions {
  /** @deprecated will probably be replaced by logLevel */
  debug?: boolean
  path?: string
  filename?: string
  encoding?: BufferEncoding
  prefix?: string
  env?: Record<string, string>
  mode?: string
}

// BSD-2-Clause License from here https://github.com/motdotla/dotenv/blob/master/lib/main.js#L12
// eslint-disable-next-line regexp/no-super-linear-backtracking
const LINE = /^\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?$/gm

// https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/#env-file-syntax
export function parseEnvStringAlt(src: string): Record<string, string> {
  const obj: Record<string, string> = {}

  // Convert buffer to string
  let lines = src.toString()

  // Convert line breaks to same format
  lines = lines.replace(/\r\n?/g, '\n')

  let match
  // eslint-disable-next-line no-cond-assign
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1]

    // Default undefined or null to empty string
    let value = (match[2] || '')

    // Remove whitespace
    value = value.trim()

    // Check if double quoted
    const maybeQuote = value[0]

    // Remove surrounding quotes
    value = value.replace(/^(['"`])([\s\S]*)\1$/gm, '$2')

    // Expand newlines if double quoted
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n')
      value = value.replace(/\\r/g, '\r')
    }

    // Add to object
    obj[key] = value
  }

  return obj
}
// Parses src into an Object
export function parseEnvString(src: string) {
  const obj: Record<string, string> = {}

  // convert Buffers before splitting into lines and processing
  String(src)
    .split(NEWLINES_MATCH)

    .forEach((line, idx) => {
      // matching "KEY' and 'VAL' in 'KEY=VAL'
      const keyValueArr = line.match(RE_INI_KEY_VAL)
      // matched?

      // log.debug("keyValueArr", keyValueArr)

      if (keyValueArr != null) {
        const key = keyValueArr[1]
        // default undefined or missing values to empty string
        let val = keyValueArr[2] || ''
        const end = val.length - 1
        const isDoubleQuoted = val[0] === '"' && val[end] === '"'
        const isSingleQuoted = val[0] === '\'' && val[end] === '\''

        // if single or double quoted, remove quotes
        if (isSingleQuoted || isDoubleQuoted) {
          val = val.substring(1, end)

          // if double quoted, expand newlines
          if (isDoubleQuoted)
            val = val.replace(RE_NEWLINES, NEWLINE)
        }
        else {
          // remove surrounding whitespace
          val = val.trim()
        }
        obj[key] = val
      }
      // else {
      //   log.debug(`did not match key and value when parsing line ${idx + 1}: ${line}`)
      // }
    })

  // log.debug("obj", obj)
  return obj
}

/**
 * Return a path relative to the current working directory
 */
export function stringToPath(
  value?: string,
  defaultValue = '.',
): string {
  return resolve(process.cwd(), value ?? defaultValue)
}

export function valueToPath(value?: any, defaultValue = ''): string {
  if (value == null)
    value = defaultValue
  return stringToPath(String(value).trim(), defaultValue)
}

export const toPath = valueToPath

export function getEnvVariableRelaxed(
  name: string,
  env = process.env,
): string | undefined {
  if (env[name] != null)
    return env[name]
  name = name.toLowerCase()
  for (const [k, v] of Object.entries(env)) {
    if (k.toLowerCase() === name)
      return v
  }
}

/** Populates process.env from .env file. */
export function setupEnv(options: EnvOptions = {}) {
  const dotenvPath: string = options?.path ?? toPath(options?.filename ?? '.env')
  const encoding: BufferEncoding = options?.encoding ?? 'utf8'
  const debug = options?.debug || false

  try {
    const parsed: Record<string, string> = {}

    function envOf(name: string) {
      return fs.existsSync(name)
        ? parseEnvStringAlt(fs.readFileSync(name, { encoding }))
        : {}
    }

    Object.assign(
      parsed,
      envOf(dotenvPath),
      envOf(`${dotenvPath}.local`),
    )

    if (options.mode) {
      Object.assign(
        parsed,
        envOf(`${dotenvPath}.${options.mode}`),
        envOf(`${dotenvPath}.${options.mode}.local`),
      )
    }

    const env = options?.env ?? process.env

    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof options?.prefix === 'string')
        key = options?.prefix + key

      if (!Object.prototype.hasOwnProperty.call(env, key)) {
        if (value != null)
          env[key] = value
      }
      // else {
      //   log.debug(`"${key}" is already defined and will not be overwritten`)
      // }
    })
    return { parsed }
  }
  catch (e) {
    return { error: e }
  }
}
