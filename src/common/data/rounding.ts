// From https://v2.dinerojs.com/docs/api/formatting/to-unit MIT

import { arraySum } from './array'

export type RoundingMode = (value: number) => number

export function isHalf(value: number) {
  return Math.abs(value) % 1 === 0.5
}
export function isEven(value: number) {
  return value % 2 === 0
}

export const roundUp: RoundingMode = value => Math.ceil(value)
export const roundDown: RoundingMode = value => Math.floor(value)
export const roundHalfUp: RoundingMode = value => Math.round(value)

/**
 * Round a number with half values to nearest odd integer.
 */
export const roundHalfOdd: RoundingMode = (value) => {
  const rounded = Math.round(value)
  if (!isHalf(value))
    return rounded

  return isEven(rounded) ? rounded - 1 : rounded
}

/**
 * Round a number with half values to nearest integer farthest from zero.
 */
export const roundHalfAwayFromZero: RoundingMode = (value) => {
  return isHalf(value)
    ? Math.sign(value) * Math.ceil(Math.abs(value))
    : Math.round(value)
}

/**
 * Round a number with half values down.
 */
export const roundHalfDown: RoundingMode = value =>
  isHalf(value) ? Math.floor(value) : Math.round(value)

/**
 * Round a number with half values to nearest even integer.
 * https://wiki.c2.com/?BankersRounding
 */
export const roundHalfEven: RoundingMode = (value) => {
  const rounded = Math.round(value)
  if (!isHalf(value))
    return rounded

  return isEven(rounded) ? rounded : rounded - 1
}

/**
 * Round a number with half values to nearest integer closest to zero.
 */
export const roundHalfTowardsZero: RoundingMode = value =>
  isHalf(value)
    ? Math.sign(value) * Math.floor(Math.abs(value))
    : Math.round(value)

/**
 * This is useful for percentages that should sum up to 100.
 * But can also be fine tuned.
 *
 * Original from https://github.com/super-ienien/percent-round
 */
export function roundArrayOfNumbersToMatchSum(ipt: number[], max = 100, decimalPlaces = 0) {
  const iptPercents: number[] = [...ipt]
  const length = ipt.length
  const out: number[] = []
  out.fill(0, length)

  const total = arraySum(iptPercents)

  if (total !== 0) {
    const powDecimalPlaces = 10 ** decimalPlaces
    const pow100 = max * powDecimalPlaces
    let check100 = 0
    for (let i = length - 1; i >= 0; i--) {
      iptPercents[i] = max * iptPercents[i] / total
      check100 += out[i] = Math.round(iptPercents[i] * powDecimalPlaces)
    }

    if (check100 !== pow100) {
      const totalDiff = (check100 - pow100)
      const roundGrain = 1
      let grainCount = Math.abs(totalDiff)
      const diffs = iptPercents.map((_, i) => Math.abs(out[i] - iptPercents[i] * powDecimalPlaces))

      while (grainCount > 0) {
        let idx = 0
        let maxDiff = diffs[0]
        for (let i = 1; i < length; i++) {
          if (maxDiff < diffs[i]) {
            // avoid negative result
            if (check100 > pow100 && out[i] - roundGrain < 0)
              continue
            idx = i
            maxDiff = diffs[i]
          }
        }
        if (check100 > pow100)
          out[idx] -= roundGrain
        else
          out[idx] += roundGrain

        diffs[idx] -= roundGrain
        grainCount--
      }
    }

    if (powDecimalPlaces > 1)
      return out.map(n => +((n / powDecimalPlaces).toFixed(decimalPlaces)))
  }

  return out
}

export function roundArrayOfObjectsToMatchSum<T extends Record<string, any>>(arr: T[], name: string, max = 100, decimalPlaces = 0): T[] {
  return roundArrayOfNumbersToMatchSum(arr.map(o => o[name]), max, decimalPlaces)
    .map((o, i) => ({
      ...arr[i],
      [name]: o,
    }))
}
