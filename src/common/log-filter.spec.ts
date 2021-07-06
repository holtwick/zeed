import { useNamespaceFilter } from "./log-filter"

describe("log-filter", function () {
  test("should match", function () {
    {
      const matches = useNamespaceFilter()
      expect(matches("a")).toBe(false)
      expect(matches("b:c")).toBe(false)
    }
    {
      const matches = useNamespaceFilter("a")
      expect(matches("a")).toBe(true)
      expect(matches("aa")).toBe(false)
      expect(matches("b:c")).toBe(false)
    }
    {
      const matches = useNamespaceFilter("a*")
      expect(matches("a")).toBe(true)
      expect(matches("aa")).toBe(true)
      expect(matches("b:c")).toBe(false)
    }
    {
      const matches = useNamespaceFilter("*")
      expect(matches("a")).toBe(true)
      expect(matches("b:c")).toBe(true)
    }
  })
})
