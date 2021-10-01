import { currency } from "./currency"

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
})
