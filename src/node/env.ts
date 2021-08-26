// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

// Adopted from https://github.com/motdotla/dotenv BSD-2

import { Logger, LogLevel } from "../common/log"

import fs from "fs"
import { resolve } from "path"

const log = Logger("zeed:env")

const NEWLINE = "\n"
const RE_INI_KEY_VAL = /^\s*([\w_.-]+)\s*=\s*(.*)?\s*$/
const RE_NEWLINES = /\\n/g
const NEWLINES_MATCH = /\n|\r|\r\n/

type csvOptions = {
  /** @deprecated will probably be replaced by logLevel */
  debug?: boolean
  path?: string
  filename?: string
  encoding?: BufferEncoding
  prefix?: string
  env?: Record<string, string>
}

// Parses src into an Object
function parse(src: string, options: csvOptions = {}) {
  let obj: Record<string, string> = {}

  // convert Buffers before splitting into lines and processing
  src
    .toString()
    .split(NEWLINES_MATCH)
    .forEach(function (line, idx) {
      // matching "KEY' and 'VAL' in 'KEY=VAL'
      const keyValueArr = line.match(RE_INI_KEY_VAL)
      // matched?

      // log.debug("keyValueArr", keyValueArr)

      if (keyValueArr != null) {
        const key = keyValueArr[1]
        // default undefined or missing values to empty string
        let val = keyValueArr[2] || ""
        const end = val.length - 1
        const isDoubleQuoted = val[0] === '"' && val[end] === '"'
        const isSingleQuoted = val[0] === "'" && val[end] === "'"

        // if single or double quoted, remove quotes
        if (isSingleQuoted || isDoubleQuoted) {
          val = val.substring(1, end)

          // if double quoted, expand newlines
          if (isDoubleQuoted) {
            val = val.replace(RE_NEWLINES, NEWLINE)
          }
        } else {
          // remove surrounding whitespace
          val = val.trim()
        }
        obj[key] = val
      } else {
        log.debug(
          `did not match key and value when parsing line ${idx + 1}: ${line}`
        )
      }
    })

  // log.debug("obj", obj)
  return obj
}

export function stringToPath(
  value?: string,
  defaultValue: string = "."
): string {
  return resolve(value ?? defaultValue)
}

export function valueToPath(value?: any, defaultValue = ""): string {
  if (value == null) value = defaultValue
  return stringToPath(String(value).trim(), defaultValue)
}

export const toPath = valueToPath

// Populates process.env from .env file
export function setupEnv(options: csvOptions = {}) {
  const dotenvPath: string =
    options?.path ?? resolve(process.cwd(), options?.filename ?? ".env")
  const encoding: BufferEncoding = options?.encoding ?? "utf8"
  const debug = options?.debug || false

  if (debug !== true) log.level = LogLevel.off

  try {
    // specifying an encoding returns a string instead of a buffer
    const parsedEnv = fs.existsSync(dotenvPath)
      ? parse(fs.readFileSync(dotenvPath, { encoding }), { debug })
      : {}
    const parsedEnvLocal = fs.existsSync(dotenvPath + ".local")
      ? parse(fs.readFileSync(dotenvPath + ".local", { encoding }), { debug })
      : {}

    const parsed: Record<string, string> = Object.assign(
      {},
      parsedEnv,
      parsedEnvLocal
    )
    let env = options?.env ?? process.env

    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof options?.prefix === "string") {
        key = options?.prefix + key
      }
      if (!Object.prototype.hasOwnProperty.call(env, key)) {
        if (value != null) {
          log.info(`set env.${key} = ${value}`)
          env[key] = value
        }
      } else {
        log.debug(`"${key}" is already defined and will not be overwritten`)
      }
    })
    return { parsed }
  } catch (e) {
    log.error(e)
    return { error: e }
  }
}
