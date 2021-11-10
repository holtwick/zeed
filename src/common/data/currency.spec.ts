import {
  Currency,
  currency,
  roundDown,
  roundHalfAwayFromZero,
  roundHalfDown,
  roundHalfEven,
  roundHalfOdd,
  roundHalfTowardsZero,
  roundHalfUp,
  roundUp,
} from "./currency"

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
    const v = Currency.avg(0.1, ["0.2", currency(0.3)])
    expect(v.value).toBe(0.2)
    expect(v.intValue).toBe(20)
    expect(v.toJSON()).toBe(0.2)
    expect(
      v.format({
        symbol: "",
        precision: 2,
      })
    ).toBe("0.20")
  })

  describe("down", () => {
    it("rounds down with a positive float below half", () => {
      expect(roundDown(1.4)).toBe(1)
    })
    it("rounds down with a negative float below half", () => {
      expect(roundDown(-1.4)).toBe(-2)
    })
    it("rounds down with a positive half float", () => {
      expect(roundDown(1.5)).toBe(1)
    })
    it("rounds down with a negative half float", () => {
      expect(roundDown(-1.5)).toBe(-2)
    })
    it("rounds down with a positive float above half", () => {
      expect(roundDown(1.6)).toBe(1)
    })
    it("rounds down with a negative float above half", () => {
      expect(roundDown(-1.6)).toBe(-2)
    })
  })

  describe("halfAwayFromZero", () => {
    it("rounds down with a positive float below half", () => {
      expect(roundHalfAwayFromZero(1.4)).toBe(1)
    })
    it("rounds up with a negative float below half", () => {
      expect(roundHalfAwayFromZero(-1.4)).toBe(-1)
    })
    it("rounds to the nearest integer away from zero with a positive half float", () => {
      expect(roundHalfAwayFromZero(1.5)).toBe(2)
    })
    it("rounds to the nearest integer away from zero with a negative half float", () => {
      expect(roundHalfAwayFromZero(-2.5)).toBe(-3)
    })
    it("rounds up with a positive float above half", () => {
      expect(roundHalfAwayFromZero(1.6)).toBe(2)
    })
    it("rounds down with a negative float above half", () => {
      expect(roundHalfAwayFromZero(-1.6)).toBe(-2)
    })
  })

  describe("halfDown", () => {
    it("rounds down with a positive float below half", () => {
      expect(roundHalfDown(1.4)).toBe(1)
    })
    it("rounds down with a negative float below half", () => {
      expect(roundHalfDown(-1.4)).toBe(-1)
    })
    it("rounds down with a positive half float", () => {
      expect(roundHalfDown(1.5)).toBe(1)
    })
    it("rounds down with a negative half float", () => {
      expect(roundHalfDown(-1.5)).toBe(-2)
    })
    it("rounds up with a positive float above half", () => {
      expect(roundHalfDown(1.6)).toBe(2)
    })
    it("rounds down with a negative float above half", () => {
      expect(roundHalfDown(-1.6)).toBe(-2)
    })
  })

  describe("halfEven", () => {
    it("rounds down with a positive float below half", () => {
      expect(roundHalfEven(1.4)).toBe(1)
    })
    it("rounds down with a negative float below half", () => {
      expect(roundHalfEven(-1.4)).toBe(-1)
    })
    it("rounds to nearest even integer with a positive half float rounding to an even integer", () => {
      expect(roundHalfEven(1.5)).toBe(2)
    })
    it("rounds to nearest even integer with a positive half float rounding to an odd integer", () => {
      expect(roundHalfEven(2.5)).toBe(2)
    })
    it("rounds to nearest even integer with a negative half float", () => {
      expect(roundHalfEven(-2.5)).toBe(-2)
    })
    it("rounds up with a positive float above half", () => {
      expect(roundHalfEven(1.6)).toBe(2)
    })
    it("rounds down with a negative float above half", () => {
      expect(roundHalfEven(-1.6)).toBe(-2)
    })
  })

  it("rounds down with a positive float below half", () => {
    expect(roundHalfOdd(1.4)).toBe(1)
  })
  it("rounds down with a negative float below half", () => {
    expect(roundHalfOdd(-1.4)).toBe(-1)
  })
  it("rounds to nearest odd integer with a positive half float rounding to an even integer", () => {
    expect(roundHalfOdd(1.5)).toBe(1)
  })
  it("rounds to nearest odd integer with a positive half float rounding to an odd integer", () => {
    expect(roundHalfOdd(2.5)).toBe(3)
  })
  it("rounds to nearest odd integer with a negative half float", () => {
    expect(roundHalfOdd(-2.5)).toBe(-3)
  })
  it("rounds up with a positive float above half", () => {
    expect(roundHalfOdd(1.6)).toBe(2)
  })
  it("rounds down with a negative float above half", () => {
    expect(roundHalfOdd(-1.6)).toBe(-2)
  })

  describe("halfTowardsZero", () => {
    it("rounds down with a positive float below half", () => {
      expect(roundHalfTowardsZero(1.4)).toBe(1)
    })
    it("rounds up with a negative float below half", () => {
      expect(roundHalfTowardsZero(-1.4)).toBe(-1)
    })
    it("rounds to the nearest integer towards zero with a positive half float", () => {
      expect(roundHalfTowardsZero(1.5)).toBe(1)
    })
    it("rounds to the nearest integer towards zero with a negative half float", () => {
      expect(roundHalfTowardsZero(-2.5)).toBe(-2)
    })
    it("rounds up with a positive float above half", () => {
      expect(roundHalfTowardsZero(1.6)).toBe(2)
    })
    it("rounds down with a negative float above half", () => {
      expect(roundHalfTowardsZero(-1.6)).toBe(-2)
    })
  })

  describe("halfUp", () => {
    it("rounds down with a positive float below half", () => {
      expect(roundHalfUp(1.4)).toBe(1)
    })
    it("rounds down with a negative float below half", () => {
      expect(roundHalfUp(-1.4)).toBe(-1)
    })
    it("rounds up with a positive half float", () => {
      expect(roundHalfUp(1.5)).toBe(2)
    })
    it("rounds up with a negative half float", () => {
      expect(roundHalfUp(-2.5)).toBe(-2)
    })
    it("rounds up with a positive float above half", () => {
      expect(roundHalfUp(1.6)).toBe(2)
    })
    it("rounds down with a negative float above half", () => {
      expect(roundHalfUp(-1.6)).toBe(-2)
    })
  })

  describe("up", () => {
    it("rounds up with a positive float below half", () => {
      expect(roundUp(1.4)).toBe(2)
    })
    it("rounds up with a negative float below half", () => {
      expect(roundUp(-1.4)).toBe(-1)
    })
    it("rounds up with a positive half float", () => {
      expect(roundUp(1.5)).toBe(2)
    })
    it("rounds up with a negative half float", () => {
      expect(roundUp(-1.5)).toBe(-1)
    })
    it("rounds up with a positive float above half", () => {
      expect(roundUp(1.6)).toBe(2)
    })
    it("rounds up with a negative float above half", () => {
      expect(roundUp(-1.6)).toBe(-1)
    })
  })
})
