import { decimal, decimalFromCents, decimalToCents, decimalCentsPart } from './decimal'

describe('currency', () => {
  it('should proove basic idea', () => {
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
    expect(decimalToCents(1.23)).toBe(123)

    {
      const v = decimal(0.3 - 0.1)
      const vv = +v.toFixed(2)
      expect(vv).toBe(0.2)
    }
  })

  it('should handle decimalCentsPart and edge cases', () => {
    // decimalCentsPart
    expect(decimalCentsPart(1.23)).toBe(23)
    expect(decimalCentsPart(1.23, 3)).toBeCloseTo(230)
    expect(decimalCentsPart(0)).toBe(0)
    expect(decimalCentsPart(-1.23)).toBeCloseTo(-23)
    // string input
    expect(decimal('1.234', 2)).toBe(1.23)
    expect(decimalFromCents('123', 2)).toBe(1.23)
    expect(decimalToCents('1.23', 2)).toBe(123)
    // custom decimal places
    expect(decimal(1.2345, 3)).toBeCloseTo(1.234, 3)
    expect(decimalFromCents(12345, 3)).toBeCloseTo(12.345, 3)
    expect(decimalToCents(12.345, 3)).toBe(12345)
    // zero and negative
    expect(decimal(0)).toBe(0)
    expect(decimal(-1.234, 2)).toBe(-1.23)
    expect(decimalFromCents(0)).toBe(0)
    expect(decimalToCents(0)).toBe(0)
  })
})
