// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { LogLevel, LogLevelAlias, LogLevelAliasType } from "./log-base"

interface NamespaceFilter {
  (name: string): boolean
  accept: RegExp[]
  reject: RegExp[]
  filter: string
}

export function getNamespaceFilterString(defaultNamespaceFilter: any): string {
  if (
    defaultNamespaceFilter === true ||
    defaultNamespaceFilter === "true" ||
    defaultNamespaceFilter === "1" ||
    (typeof defaultNamespaceFilter === "number" && defaultNamespaceFilter !== 0)
  ) {
    defaultNamespaceFilter = "*"
  } else if (
    defaultNamespaceFilter === false ||
    defaultNamespaceFilter === "false" ||
    defaultNamespaceFilter === 0 ||
    defaultNamespaceFilter === "0" ||
    defaultNamespaceFilter == null ||
    defaultNamespaceFilter === "null" ||
    defaultNamespaceFilter === "undefined"
  ) {
    defaultNamespaceFilter = ""
  } else {
    defaultNamespaceFilter = String(defaultNamespaceFilter)
  }
  return defaultNamespaceFilter
}

// todo sideffects
const defaultNamespaceFilter: string = getNamespaceFilterString(
  typeof process !== "undefined"
    ? process.env.ZEED ?? process.env.DEBUG
    : typeof localStorage !== "undefined"
    ? localStorage.zeed ?? localStorage.debug
    : "*"
)

/**
 * Filter as described here https://github.com/visionmedia/debug#wildcards
 *
 * @param filter Namespace filter
 * @returns Function to check if filter applies
 */
export function useNamespaceFilter(
  filter: string = defaultNamespaceFilter
): NamespaceFilter {
  let fn: any // (name: string) => boolean
  let reject = [] as RegExp[]
  let accept = [] as RegExp[]

  if (!filter) {
    fn = function (name: string) {
      return false
    }
  } else if (filter === "*") {
    fn = function (name: string) {
      return true
    }
  } else {
    let i
    const split = filter.split(/[\s,]+/)
    const len = split.length
    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue
      }
      let template = split[i].replace(/\*/g, ".*?")
      if (template[0] === "-") {
        reject.push(new RegExp("^" + template.substr(1) + "$"))
      } else {
        accept.push(new RegExp("^" + template + "$"))
      }
    }

    fn = function (name: string) {
      if (reject.length === 0 && accept.length === 0) {
        return true
      }
      let i, len
      for (i = 0, len = reject.length; i < len; i++) {
        if (reject[i].test(name)) {
          return false
        }
      }
      for (i = 0, len = accept.length; i < len; i++) {
        if (accept[i].test(name)) {
          return true
        }
      }
      return false
    }
  }
  fn.accept = accept
  fn.reject = reject
  fn.filter = filter
  return fn as NamespaceFilter
}

// todo sideffects
const defaultLevelFilter: any =
  typeof process !== "undefined"
    ? process.env.ZEED_LEVEL ?? process.env.LEVEL ?? process.env.DEBUG_LEVEL
    : typeof localStorage !== "undefined"
    ? localStorage.zeed_level ?? localStorage.level ?? localStorage.debug_level
    : undefined

export function parseLogLevel(filter: LogLevelAliasType): LogLevel {
  if (filter === false) return LogLevel.off
  if (typeof filter === "number") return filter as number
  if (typeof filter === "string") {
    const l = LogLevelAlias[filter.toLocaleLowerCase().trim()]
    if (l != null) return l
  }
  return LogLevel.all
}

export function useLevelFilter(
  filter: string | number | boolean | LogLevelAliasType = defaultLevelFilter
): (level: LogLevel) => boolean {
  const filterLevel = parseLogLevel(filter)
  return (level) => level >= filterLevel
}
