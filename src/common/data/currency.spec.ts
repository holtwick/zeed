import { Currency, currency } from "./currency"

describe("currency", () => {
  it("should calc", () => {
    const v = currency(0.1).add(0.2)
    expect(v.value).toBe(0.3)
    expect(v.intValue).toBe(30)
    expect(v.toJSON()).toBe(0.3)
    expect(
      v.format({
        symbol: "",
        precision: 2,
      })
    ).toBe("0.30")
  })

  it("should summarize", () => {
    const v = Currency.sum(0.1, [0.2])
    expect(v.value).toBe(0.3)
    expect(v.intValue).toBe(30)
    expect(v.toJSON()).toBe(0.3)
    expect(
      v.format({
        symbol: "",
        precision: 2,
      })
    ).toBe("0.30")
  })

  it("should summarize", () => {
    const v = Currency.avg(0.1, [0.2])
    expect(v.value).toBe(0.15)
    expect(v.intValue).toBe(15)
    expect(v.toJSON()).toBe(0.15)
    expect(
      v.format({
        symbol: "",
        precision: 2,
      })
    ).toBe("0.15")
  })
})
