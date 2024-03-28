import { arraySum } from './array'
import {
  roundArrayOfNumbersToMatchSum,
  roundArrayOfObjectsToMatchSum,
  roundDown,
  roundHalfAwayFromZero,
  roundHalfDown,
  roundHalfEven,
  roundHalfOdd,
  roundHalfTowardsZero,
  roundHalfUp,
  roundUp,
} from './rounding'

describe('currency', () => {
  describe('down', () => {
    it('rounds down with a positive float below half', () => {
      expect(roundDown(1.4)).toBe(1)
    })
    it('rounds down with a negative float below half', () => {
      expect(roundDown(-1.4)).toBe(-2)
    })
    it('rounds down with a positive half float', () => {
      expect(roundDown(1.5)).toBe(1)
    })
    it('rounds down with a negative half float', () => {
      expect(roundDown(-1.5)).toBe(-2)
    })
    it('rounds down with a positive float above half', () => {
      expect(roundDown(1.6)).toBe(1)
    })
    it('rounds down with a negative float above half', () => {
      expect(roundDown(-1.6)).toBe(-2)
    })
  })

  describe('halfAwayFromZero', () => {
    it('rounds down with a positive float below half', () => {
      expect(roundHalfAwayFromZero(1.4)).toBe(1)
    })
    it('rounds up with a negative float below half', () => {
      expect(roundHalfAwayFromZero(-1.4)).toBe(-1)
    })
    it('rounds to the nearest integer away from zero with a positive half float', () => {
      expect(roundHalfAwayFromZero(1.5)).toBe(2)
    })
    it('rounds to the nearest integer away from zero with a negative half float', () => {
      expect(roundHalfAwayFromZero(-2.5)).toBe(-3)
    })
    it('rounds up with a positive float above half', () => {
      expect(roundHalfAwayFromZero(1.6)).toBe(2)
    })
    it('rounds down with a negative float above half', () => {
      expect(roundHalfAwayFromZero(-1.6)).toBe(-2)
    })
  })

  describe('halfDown', () => {
    it('rounds down with a positive float below half', () => {
      expect(roundHalfDown(1.4)).toBe(1)
    })
    it('rounds down with a negative float below half', () => {
      expect(roundHalfDown(-1.4)).toBe(-1)
    })
    it('rounds down with a positive half float', () => {
      expect(roundHalfDown(1.5)).toBe(1)
    })
    it('rounds down with a negative half float', () => {
      expect(roundHalfDown(-1.5)).toBe(-2)
    })
    it('rounds up with a positive float above half', () => {
      expect(roundHalfDown(1.6)).toBe(2)
    })
    it('rounds down with a negative float above half', () => {
      expect(roundHalfDown(-1.6)).toBe(-2)
    })
  })

  describe('halfEven', () => {
    it('rounds down with a positive float below half', () => {
      expect(roundHalfEven(1.4)).toBe(1)
    })
    it('rounds down with a negative float below half', () => {
      expect(roundHalfEven(-1.4)).toBe(-1)
    })
    it('rounds to nearest even integer with a positive half float rounding to an even integer', () => {
      expect(roundHalfEven(1.5)).toBe(2)
    })
    it('rounds to nearest even integer with a positive half float rounding to an odd integer', () => {
      expect(roundHalfEven(2.5)).toBe(2)
    })
    it('rounds to nearest even integer with a negative half float', () => {
      expect(roundHalfEven(-2.5)).toBe(-2)
    })
    it('rounds up with a positive float above half', () => {
      expect(roundHalfEven(1.6)).toBe(2)
    })
    it('rounds down with a negative float above half', () => {
      expect(roundHalfEven(-1.6)).toBe(-2)
    })
  })

  it('rounds down with a positive float below half', () => {
    expect(roundHalfOdd(1.4)).toBe(1)
  })
  it('rounds down with a negative float below half', () => {
    expect(roundHalfOdd(-1.4)).toBe(-1)
  })
  it('rounds to nearest odd integer with a positive half float rounding to an even integer', () => {
    expect(roundHalfOdd(1.5)).toBe(1)
  })
  it('rounds to nearest odd integer with a positive half float rounding to an odd integer', () => {
    expect(roundHalfOdd(2.5)).toBe(3)
  })
  it('rounds to nearest odd integer with a negative half float', () => {
    expect(roundHalfOdd(-2.5)).toBe(-3)
  })
  it('rounds up with a positive float above half', () => {
    expect(roundHalfOdd(1.6)).toBe(2)
  })
  it('rounds down with a negative float above half', () => {
    expect(roundHalfOdd(-1.6)).toBe(-2)
  })

  describe('halfTowardsZero', () => {
    it('rounds down with a positive float below half', () => {
      expect(roundHalfTowardsZero(1.4)).toBe(1)
    })
    it('rounds up with a negative float below half', () => {
      expect(roundHalfTowardsZero(-1.4)).toBe(-1)
    })
    it('rounds to the nearest integer towards zero with a positive half float', () => {
      expect(roundHalfTowardsZero(1.5)).toBe(1)
    })
    it('rounds to the nearest integer towards zero with a negative half float', () => {
      expect(roundHalfTowardsZero(-2.5)).toBe(-2)
    })
    it('rounds up with a positive float above half', () => {
      expect(roundHalfTowardsZero(1.6)).toBe(2)
    })
    it('rounds down with a negative float above half', () => {
      expect(roundHalfTowardsZero(-1.6)).toBe(-2)
    })
  })

  describe('halfUp', () => {
    it('rounds down with a positive float below half', () => {
      expect(roundHalfUp(1.4)).toBe(1)
    })
    it('rounds down with a negative float below half', () => {
      expect(roundHalfUp(-1.4)).toBe(-1)
    })
    it('rounds up with a positive half float', () => {
      expect(roundHalfUp(1.5)).toBe(2)
    })
    it('rounds up with a negative half float', () => {
      expect(roundHalfUp(-2.5)).toBe(-2)
    })
    it('rounds up with a positive float above half', () => {
      expect(roundHalfUp(1.6)).toBe(2)
    })
    it('rounds down with a negative float above half', () => {
      expect(roundHalfUp(-1.6)).toBe(-2)
    })
  })

  describe('up', () => {
    it('rounds up with a positive float below half', () => {
      expect(roundUp(1.4)).toBe(2)
    })
    it('rounds up with a negative float below half', () => {
      expect(roundUp(-1.4)).toBe(-1)
    })
    it('rounds up with a positive half float', () => {
      expect(roundUp(1.5)).toBe(2)
    })
    it('rounds up with a negative half float', () => {
      expect(roundUp(-1.5)).toBe(-1)
    })
    it('rounds up with a positive float above half', () => {
      expect(roundUp(1.6)).toBe(2)
    })
    it('rounds up with a negative float above half', () => {
      expect(roundUp(-1.6)).toBe(-1)
    })
  })

  it('distribute percentages', () => {
    const values = [13.626332, 47.989636, 9.596008, 28.788024]

    const objs = [{
      name: '13',
      percent: 13.626332,
    }, {
      name: '47',
      percent: 47.989636,
    }, {
      name: '9',
      percent: 9.596008,
    }, {
      name: '28',
      percent: 28.788024,
    }]

    expect(arraySum(roundArrayOfNumbersToMatchSum(values))).toEqual(100)
    expect(arraySum(roundArrayOfNumbersToMatchSum(values, 95, 2))).toEqual(95)

    expect(roundArrayOfNumbersToMatchSum(values)).toMatchInlineSnapshot(`
      Array [
        14,
        48,
        9,
        29,
      ]
    `)

    expect(roundArrayOfNumbersToMatchSum(values, 95, 2)).toMatchInlineSnapshot(`
      Array [
        12.94,
        45.59,
        9.12,
        27.35,
      ]
    `)

    expect(roundArrayOfObjectsToMatchSum(objs, 'percent')).toMatchInlineSnapshot(`
      Array [
        Object {
          "name": "13",
          "percent": 14,
        },
        Object {
          "name": "47",
          "percent": 48,
        },
        Object {
          "name": "9",
          "percent": 9,
        },
        Object {
          "name": "28",
          "percent": 29,
        },
      ]
    `)
  })
})
