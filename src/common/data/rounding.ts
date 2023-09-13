// From https://v2.dinerojs.com/docs/api/formatting/to-unit MIT

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
 * @param value
 */
export const roundHalfOdd: RoundingMode = (value) => {
  const rounded = Math.round(value)
  if (!isHalf(value))
    return rounded

  return isEven(rounded) ? rounded - 1 : rounded
}

/**
 * Round a number with half values to nearest integer farthest from zero.
 * @param value
 */
export const roundHalfAwayFromZero: RoundingMode = (value) => {
  return isHalf(value)
    ? Math.sign(value) * Math.ceil(Math.abs(value))
    : Math.round(value)
}

/**
 * Round a number with half values down.
 * @param value
 */
export const roundHalfDown: RoundingMode = value =>
  isHalf(value) ? Math.floor(value) : Math.round(value)

/**
 * Round a number with half values to nearest even integer.
 * https://wiki.c2.com/?BankersRounding
 * @param value
 */
export const roundHalfEven: RoundingMode = (value) => {
  const rounded = Math.round(value)
  if (!isHalf(value))
    return rounded

  return isEven(rounded) ? rounded : rounded - 1
}

/**
 * Round a number with half values to nearest integer closest to zero.
 * @param value
 */
export const roundHalfTowardsZero: RoundingMode = value =>
  isHalf(value)
    ? Math.sign(value) * Math.floor(Math.abs(value))
    : Math.round(value)
