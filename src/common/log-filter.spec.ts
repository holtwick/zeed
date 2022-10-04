// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import {
  getNamespaceFilterString,
  parseLogLevel,
  useLevelFilter,
  useNamespaceFilter,
} from './log-filter'
import { LogLevel } from './log-base'

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
      expect(matches.accept).toEqual([/^a$/])
      expect(matches.reject).toEqual([])
      expect(matches('a')).toBe(true)
      expect(matches('aa')).toBe(false)
      expect(matches('b:c')).toBe(false)
    }
    {
      const matches = useNamespaceFilter('a*')
      expect(matches.filter).toBe('a*')
      expect(matches.accept).toEqual([/^a.*?$/])
      expect(matches.reject).toEqual([])
      expect(matches('a')).toBe(true)
      expect(matches('aa')).toBe(true)
      expect(matches('b:c')).toBe(false)
    }
    {
      const matches = useNamespaceFilter('a*,b*,-c*')
      expect(matches.filter).toBe('a*,b*,-c*')
      expect(matches.accept).toEqual([/^a.*?$/, /^b.*?$/])
      expect(matches.reject).toEqual([/^c.*?$/])
      expect(matches('a')).toBe(true)
      expect(matches('aa')).toBe(true)
      expect(matches('b:c')).toBe(true)
      expect(matches('c:d')).toBe(false)
    }
    {
      const matches = useNamespaceFilter('*,-c*')
      expect(matches.filter).toBe('*,-c*')
      expect(matches.accept).toEqual([/^.*?$/])
      expect(matches.reject).toEqual([/^c.*?$/])
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
      expect(levelFilter(LogLevel.debug)).toBe(false)
      expect(levelFilter(LogLevel.warn)).toBe(false)
      expect(levelFilter(LogLevel.error)).toBe(true)
    }
    {
      const levelFilter = useLevelFilter('adfdfds')
      expect(levelFilter(LogLevel.debug)).toBe(true)
      expect(levelFilter(LogLevel.warn)).toBe(true)
      expect(levelFilter(LogLevel.error)).toBe(true)
    }
    {
      const levelFilter = useLevelFilter(LogLevel.warn)
      expect(levelFilter(LogLevel.debug)).toBe(false)
      expect(levelFilter(LogLevel.warn)).toBe(true)
      expect(levelFilter(LogLevel.error)).toBe(true)
    }
  })

  it('should identify log level', () => {
    expect(parseLogLevel(false)).toEqual(LogLevel.off)
    expect(parseLogLevel('info')).toEqual(LogLevel.info)
    expect(parseLogLevel(LogLevel.error)).toEqual(LogLevel.error)
    expect(parseLogLevel(true)).toEqual(LogLevel.all)
    expect(parseLogLevel(2)).toEqual(LogLevel.warn)
  })
})
