// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { LogLevelAll, LogLevelDebug, LogLevelError, LogLevelInfo, LogLevelOff, LogLevelWarn } from './log-base'
import { getNamespaceFilterString, joinLogStrings, parseLogLevel, useLevelFilter, useNamespaceFilter } from './log-filter'

describe('log-filter', () => {
  test('should match', () => {
    // {
    //   // This one depends on the calling tester, therefore not deterministic
    //
    //   const matches = useNamespaceFilter()
    //   expect(matches.filter).toBe("")
    //   expect(matches.accept).toEqual([])
    //   expect(matches.reject).toEqual([])
    //   expect(matches("a")).toBe(false)
    //   expect(matches("b:c")).toBe(false)
    // }
    {
      const matches = useNamespaceFilter('a')
      expect(matches.filter).toBe('a')
      expect(matches.accept).toEqual([/^a/])
      expect(matches.reject).toEqual([])
      expect(matches('a')).toBe(true)
      expect(matches('aa')).toBe(true)
      expect(matches('b:c')).toBe(false)
    }
    {
      const matches = useNamespaceFilter('a*')
      expect(matches.filter).toBe('a*')
      expect(matches.accept).toEqual([/^a.*?/])
      expect(matches.reject).toEqual([])
      expect(matches('a')).toBe(true)
      expect(matches('aa')).toBe(true)
      expect(matches('b:c')).toBe(false)
    }
    {
      const matches = useNamespaceFilter('a*,b*,-c*')
      expect(matches.filter).toBe('a*,b*,-c*')
      expect(matches.accept).toEqual([/^a.*?/, /^b.*?/])
      expect(matches.reject).toEqual([/^c.*?/])
      expect(matches('a')).toBe(true)
      expect(matches('aa')).toBe(true)
      expect(matches('b:c')).toBe(true)
      expect(matches('c:d')).toBe(false)
    }
    {
      const matches = useNamespaceFilter('*,-c*')
      expect(matches.filter).toBe('*,-c*')
      expect(matches.accept).toEqual([/^.*?/])
      expect(matches.reject).toEqual([/^c.*?/])
      expect(matches('a')).toBe(true)
      expect(matches('aa')).toBe(true)
      expect(matches('b:c')).toBe(true)
      expect(matches('c:d')).toBe(false)
    }
    {
      const matches = useNamespaceFilter('*,-c')
      expect(matches.filter).toBe('*,-c')
      expect(matches.accept).toEqual([/^.*?/])
      expect(matches.reject).toEqual([/^c/])
      expect(matches('a')).toBe(true)
      expect(matches('aa')).toBe(true)
      expect(matches('b:c')).toBe(true)
      expect(matches('c:d')).toBe(false)
    }
    {
      const matches = useNamespaceFilter('*')
      expect(matches.filter).toBe('*')
      expect(matches.accept).toEqual([])
      expect(matches.reject).toEqual([])
      expect(matches('a')).toBe(true)
      expect(matches('b:c')).toBe(true)
    }
  })

  it('should interprete filter right', () => {
    expect(getNamespaceFilterString('')).toEqual('')
    expect(getNamespaceFilterString(0)).toEqual('')
    expect(getNamespaceFilterString(false)).toEqual('')
    expect(getNamespaceFilterString('false')).toEqual('')
    expect(getNamespaceFilterString(null)).toEqual('')

    expect(getNamespaceFilterString('*')).toEqual('*')
    expect(getNamespaceFilterString(1)).toEqual('*')
    expect(getNamespaceFilterString(true)).toEqual('*')
    expect(getNamespaceFilterString('true')).toEqual('*')

    expect(getNamespaceFilterString('a:b')).toEqual('a:b')
  })

  it('should filter by level', () => {
    {
      const levelFilter = useLevelFilter('err')
      expect(levelFilter(LogLevelDebug)).toBe(false)
      expect(levelFilter(LogLevelWarn)).toBe(false)
      expect(levelFilter(LogLevelError)).toBe(true)
    }
    {
      const levelFilter = useLevelFilter('adfdfds')
      expect(levelFilter(LogLevelDebug)).toBe(true)
      expect(levelFilter(LogLevelWarn)).toBe(true)
      expect(levelFilter(LogLevelError)).toBe(true)
    }
    {
      const levelFilter = useLevelFilter(LogLevelWarn)
      expect(levelFilter(LogLevelDebug)).toBe(false)
      expect(levelFilter(LogLevelWarn)).toBe(true)
      expect(levelFilter(LogLevelError)).toBe(true)
    }
  })

  it('should identify log level', () => {
    expect(parseLogLevel(false)).toEqual(LogLevelOff)
    expect(parseLogLevel('info')).toEqual(LogLevelInfo)
    expect(parseLogLevel(LogLevelError)).toEqual(LogLevelError)
    expect(parseLogLevel(true)).toEqual(LogLevelAll)
    expect(parseLogLevel(2)).toEqual(LogLevelWarn)
  })

  it('should join strings', () => {
    expect(joinLogStrings('test')).toEqual(['test'])
    expect(joinLogStrings('test', 'more', 1, 2, 3)).toEqual(['test more', 1, 2, 3])
    expect(joinLogStrings('test', { a: 1 })).toEqual(['test', { a: 1 }])
    expect(joinLogStrings('test', 'a', 'b', true, undefined, null, { a: 1 })).toEqual(['test a', 'b', true, undefined, null, { a: 1 }])
  })
})
