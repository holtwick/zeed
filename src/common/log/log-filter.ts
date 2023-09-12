// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.
/* eslint-disable n/prefer-global/process */

import { isString } from '../data'
import type { LogLevel, LogLevelAliasType } from './log-base'
import { LogLevelAlias, LogLevelAll, LogLevelOff } from './log-base'

interface NamespaceFilter {
  (name: string): boolean
  accept: RegExp[]
  reject: RegExp[]
  filter: string
}

export function getNamespaceFilterString(defaultNamespaceFilter: any): string {
  if (
    defaultNamespaceFilter === true
    || defaultNamespaceFilter === 'true'
    || defaultNamespaceFilter === '1'
    || (typeof defaultNamespaceFilter === 'number' && defaultNamespaceFilter !== 0)
  )
    defaultNamespaceFilter = '*'
  else if (
    defaultNamespaceFilter === false
    || defaultNamespaceFilter === 'false'
    || defaultNamespaceFilter === 0
    || defaultNamespaceFilter === '0'
    || defaultNamespaceFilter == null
    || defaultNamespaceFilter === 'null'
    || defaultNamespaceFilter === 'undefined'
  )
    defaultNamespaceFilter = ''
  else
    defaultNamespaceFilter = String(defaultNamespaceFilter)

  return defaultNamespaceFilter
}

function getDefaultNamespaceFilter() {
  return getNamespaceFilterString(
    typeof process !== 'undefined'
      ? process.env.ZEED ?? process.env.DEBUG
      : typeof localStorage !== 'undefined'
        ? localStorage.zeed ?? localStorage.debug
        : '*',
  )
}

/**
 * Filter as described here https://github.com/visionmedia/debug#wildcards
 *
 * @param filter Namespace filter
 * @returns Function to check if filter applies
 */
export function useNamespaceFilter(
  filter: string = getDefaultNamespaceFilter(),
): NamespaceFilter {
  let fn: any // (name: string) => boolean
  const reject = [] as RegExp[]
  const accept = [] as RegExp[]

  if (!filter) {
    fn = function (_name: string) {
      return false
    }
  }
  else if (filter === '*') {
    fn = function (_name: string) {
      return true
    }
  }
  else {
    let i
    const split = filter.split(/[\s,]+/)
    const len = split.length
    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue
      }
      const template = split[i].replace(/\*/g, '.*?')
      if (template[0] === '-')
        reject.push(new RegExp(`^${template.substr(1)}$`))
      else
        accept.push(new RegExp(`^${template}$`))
    }

    fn = function (name: string) {
      if (reject.length === 0 && accept.length === 0)
        return true

      let i, len
      for (i = 0, len = reject.length; i < len; i++) {
        if (reject[i].test(name))
          return false
      }
      for (i = 0, len = accept.length; i < len; i++) {
        if (accept[i].test(name))
          return true
      }
      return false
    }
  }
  fn.accept = accept
  fn.reject = reject
  fn.filter = filter
  return fn as NamespaceFilter
}

function getDefaultLevelFilter() {
  return typeof process !== 'undefined'
    ? process.env.ZEED_LEVEL ?? process.env.LEVEL ?? process.env.DEBUG_LEVEL
    : typeof localStorage !== 'undefined'
      ? localStorage.zeed_level ?? localStorage.level ?? localStorage.debug_level
      : undefined
}

export function parseLogLevel(filter: LogLevelAliasType): LogLevel {
  if (filter === false)
    return LogLevelOff
  if (typeof filter === 'number')
    return filter
  if (typeof filter === 'string') {
    const l = LogLevelAlias[filter.toLocaleLowerCase().trim()]
    if (l != null)
      return l
  }
  return LogLevelAll
}

export function useLevelFilter(
  filter: string | number | boolean | LogLevelAliasType = getDefaultLevelFilter(),
): (level: number) => boolean {
  const filterLevel = parseLogLevel(filter)
  return level => level >= filterLevel
}

export function joinLogStrings(...messages: any[]) {
  if (isString(messages[1]))
    return [`${String(messages[0])} ${String(messages[1])}`, ...messages.slice(2)]
  return messages

  // let s = ''
  // for (let i = 0; i < messages.length; i++) {
  //   const element = messages[i]
  //   if (isString(element))
  //     s += (s.length > 1 ? ' ' : '') + String(element)
  //   else
  //     return [s, ...messages.slice(i)]
  // }
  // return [s]
}
