// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { useNamespaceFilter } from "./log-filter"

describe("log-filter", function () {
  test("should match", function () {
    {
      const matches = useNamespaceFilter()
      expect(matches.filter).toBe(undefined)
      expect(matches.accept).toEqual([])
      expect(matches.reject).toEqual([])
      expect(matches("a")).toBe(false)
      expect(matches("b:c")).toBe(false)
    }
    {
      const matches = useNamespaceFilter("a")
      expect(matches.filter).toBe("a")
      expect(matches.accept).toEqual([/^a$/])
      expect(matches.reject).toEqual([])
      expect(matches("a")).toBe(true)
      expect(matches("aa")).toBe(false)
      expect(matches("b:c")).toBe(false)
    }
    {
      const matches = useNamespaceFilter("a*")
      expect(matches.filter).toBe("a*")
      expect(matches.accept).toEqual([/^a.*?$/])
      expect(matches.reject).toEqual([])
      expect(matches("a")).toBe(true)
      expect(matches("aa")).toBe(true)
      expect(matches("b:c")).toBe(false)
    }
    {
      const matches = useNamespaceFilter("a*,b*,-c*")
      expect(matches.filter).toBe("a*,b*,-c*")
      expect(matches.accept).toEqual([/^a.*?$/, /^b.*?$/])
      expect(matches.reject).toEqual([/^c.*?$/])
      expect(matches("a")).toBe(true)
      expect(matches("aa")).toBe(true)
      expect(matches("b:c")).toBe(true)
      expect(matches("c:d")).toBe(false)
    }
    {
      const matches = useNamespaceFilter("*,-c*")
      expect(matches.filter).toBe("*,-c*")
      expect(matches.accept).toEqual([/^.*?$/])
      expect(matches.reject).toEqual([/^c.*?$/])
      expect(matches("a")).toBe(true)
      expect(matches("aa")).toBe(true)
      expect(matches("b:c")).toBe(true)
      expect(matches("c:d")).toBe(false)
    }
    {
      const matches = useNamespaceFilter("*")
      expect(matches.filter).toBe("*")
      expect(matches.accept).toEqual([])
      expect(matches.reject).toEqual([])
      expect(matches("a")).toBe(true)
      expect(matches("b:c")).toBe(true)
    }
  })
})
