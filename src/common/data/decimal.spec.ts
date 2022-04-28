import { decimal, decimalFromCents } from "./decimal"

describe("currency", () => {
  it("should proove basic idea", () => {
    {
      const v = 0.3 - 0.1
      expect(v).toBe(0.19999999999999998)
    }
    {
      const v = 3 - 1
      expect(v).toBe(2)
    }
    {
      const v = 0.3 - 0.1
      const vv = +v.toFixed(2)
      expect(vv).toBe(0.2)
    }

    expect(decimal(0.123)).toBe(0.12)
    expect(decimal(0.126)).toBe(0.13)
    expect(decimal(0.126, 3)).toBe(0.126)
    expect(decimal(0.126, 1)).toBe(0.1)
    expect(decimal(0.126, 0)).toBe(0)
    expect(decimalFromCents(123)).toBe(1.23)

    {
      const v = decimal(0.3 - 0.1)
      const vv = +v.toFixed(2)
      expect(vv).toBe(0.2)
    }
  })
})
