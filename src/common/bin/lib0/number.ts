/**
 * Original at https://github.com/dmonad/lib0
 *
 * Utility helpers for working with numbers.
 */

import * as binary from './binary.js'

export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER
export const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER

export const LOWEST_INT32 = 1 << 31
export const HIGHEST_INT32: number = binary.BITS31

export const isInteger = Number.isInteger || (num => typeof num === 'number' && isFinite(num) && Math.floor(num) === num)
export const isNaN = Number.isNaN
export const parseInt = Number.parseInt
