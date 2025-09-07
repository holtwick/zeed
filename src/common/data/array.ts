/* eslint-disable no-cond-assign */

import type { NestedArray } from '../types'
import { getSecureRandomIfPossible } from './math'
import { cmp } from './orderby'

/**
 * Return a new array with duplicate values removed. Maintains first occurrence order.
 * @typeParam T - element type
 * @param arr - input array
 * @returns new array containing unique elements from `arr`
 */
export function arrayUnique<T>(arr: T[]): T[] {
  return arr.filter((n: any, index: any) => arr.indexOf(n) === index)
}

/**
 * Return elements present in `x` but not in `y`.
 * @typeParam T - element type
 * @param left - left-hand array
 * @param right - array of elements to exclude
 * @returns new array with elements from `left` that are not included in `right`
 */
export function arrayMinus<T>(left: T[], right: T[]): T[] {
  return arrayUnique(left.filter((n: any) => !right.includes(n)))
}

/**
 * Return the union of multiple arrays (unique elements across all inputs).
 * @typeParam T - element type
 * @param arrays - arrays to union
 * @returns new array with unique elements from all provided arrays
 */
export function arrayUnion<T>(...arrays: T[][]): T[] {
  return arrayUnique(arrays.reduce((acc: T[] = [], value) => acc.concat(value), []))
}

/** `[1,[2,3]]` becomes `[1,2,3]` */
/**
 * Flatten nested arrays to a single-level array.
 * Example: `[1, [2, 3]]` becomes `[1, 2, 3]`.
 * @typeParam T - element type
 * @param arrays - one or more nested arrays to flatten
 * @returns flattened array containing all elements
 */
export function arrayFlatten<T>(...arrays: NestedArray<T>[]): T[] {
  return (arrays as any).flat(Number.POSITIVE_INFINITY)
}

/**
 * Return the intersection of two arrays (elements present in both).
 * @typeParam T - element type
 * @param left - first array
 * @param right - second array
 * @returns new array with elements present in both `left` and `right`
 */
export function arrayIntersection<T>(left: T[], right: T[]): T[] {
  return arrayUnique<T>(left).filter((n: any) => right.includes(n))
}

/**
 * Return the symmetric difference between two arrays (elements in either array but not both).
 * @typeParam T - element type
 */
export function arraySymmetricDifference<T>(left: T[], right: T[]): T[] {
  return arrayMinus(arrayUnion(left, right), arrayIntersection(left, right))
  // return arrayUnique(x.filter(n => !y.includes(n)).concat(y.filter(n => !x.includes(n))))
}

// export function arrayApply<T>(fn:  any, a: T[]): T[] {
//   return a.reduce(fn, [])
// }

/**
 * Remove all occurrences of `el` from `arr` in-place and return the mutated array.
 * If `arr` is not an array, returns an empty array.
 * @typeParam T - element type
 * @param arr - array to modify
 * @param el - element to remove
 * @returns the same array instance with `el` removed
 */
export function arrayRemoveElement<T>(arr: T[], el: T): T[] {
  if (arr && Array.isArray(arr)) {
    let index
    while ((index = arr.indexOf(el)) !== -1)
      arr.splice(index, 1)
    return arr
  }
  return []
}

/** Only have it once in the set */
/**
 * Ensure `el` exists in `arr`. If not present, push it and return the array.
 * @typeParam T - element type
 * @param arr - target array
 * @param el - element to ensure
 * @returns the same array instance (modified if `el` was added)
 */
export function arraySetElement<T>(arr: T[], el: T): T[] {
  if (!arr.includes(el))
    arr.push(el)
  return arr
}

// via https://stackoverflow.com/a/49587869 and Erwin
/**
 * Filter an array in-place using `fn` and return the same array instance.
 * This replaces the array contents with the filtered result.
 * @typeParam T - element type
 * @param arr - array to filter in-place
 * @param fn - predicate to determine which elements to keep
 * @returns the same array instance after filtering
 */
export function arrayFilterInPlace<T>(arr: T[], fn: (el: T) => boolean): T[] {
  arr.splice(0, arr.length, ...arr.filter(fn))
  return arr
}

// via https://stackoverflow.com/a/49587869 and Erwin
/**
 * Toggle presence of `el` in `array` in-place: remove if present, add if missing.
 * @typeParam T - element type
 * @param arr - array to modify
 * @param el - element to toggle
 * @returns the same array instance after the toggle
 */
export function arrayToggleInPlace<T>(arr: T[], el: T): T[] {
  const index = arr.findIndex(e => e === el)
  if (index >= 0)
    arr.splice(index, 1)
  else arr.push(el)
  return arr
}

/**
 * Empty an array in-place (remove all elements) and return it.
 * @typeParam T - element type
 */
export function arrayEmptyInPlace<T>(arr: T[]): T[] {
  arr.splice(0, arr.length)
  return arr
}

/**
 * Replace the contents of `array` in-place with `newContent` and return it.
 * @typeParam T - element type
 * @param arr - target array to overwrite
 * @param newContent - new contents to set
 * @returns the same array instance after replacement
 */
export function arraySetArrayInPlace<T>(arr: T[], newContent: T[]): T[] {
  arr.splice(0, arr.length, ...newContent)
  return arr
}

/**
 * Return a sorted copy of the provided iterable or array-like object.
 * @typeParam T - element type
 * @param arr - iterable or array-like input
 * @param compareFn - optional compare function (defaults to `cmp`)
 * @returns a new array sorted according to `compareFn`
 */
export function arraySorted<T>(
  arr: Iterable<T> | ArrayLike<T>,
  compareFn: ((a: T, b: T) => number) | undefined = cmp,
): T[] {
  return Array.from(arr).sort(compareFn)
}

/**
 * Return a new array with numbers sorted in ascending order.
 * @param arr - array of numbers
 * @returns sorted array of numbers
 */
export function arraySortedNumbers(arr: number[]): number[] {
  return arraySorted(arr, (l: number, r: number) => l - r)
}

/**
 * Check strict equality of two arrays by length and element-wise === comparison.
 * @typeParam T - element type
 * @param array1 - first array
 * @param array2 - second array
 * @returns `true` if arrays are same length and all elements strictly equal
 */
export function arrayIsEqual<T>(array1: T[], array2: T[]): boolean {
  return (
    array1.length === array2.length
    && array1.every((value, index) => value === array2[index])
  )
}

/**
 * Shuffle an array in-place using a secure random source if available.
 * Note: uses Array.sort with random comparator which is sufficient for many cases but
 * not perfectly uniform. Returns the same mutated array.
 * @typeParam T - element type
 * @param array - array to shuffle in-place
 * @returns the shuffled array (same instance)
 */
export function arrayShuffleInPlace<T>(arr: T[]): T[] {
  arr.sort(() => (getSecureRandomIfPossible() > 0.5 ? 1 : -1))

  // Alternative https://github.com/sindresorhus/array-shuffle/blob/main/index.js#L8
  // for (let index = array.length - 1; index > 0; index--) {
  //   const newIndex = Math.floor(Math.random() * (index + 1));
  //   [array[index], array[newIndex]] = [array[newIndex], array[index]];
  // }

  return arr
}

/**
 * Return a shuffled copy of `array` (original array is not modified).
 * @typeParam T - element type
 * @param array - input array
 * @returns a new shuffled array
 */
export function arrayShuffle<T>(arr: T[]): T[] {
  return arrayShuffleInPlace(Array.from(arr))
}

/** Randomly shuffle the order of the array's elements. Force to have a different order if array has more than one element. */
/**
 * Shuffle `array` and ensure the returned order differs from the original when possible.
 * If array length is 0 or 1 it is returned unchanged.
 * @typeParam T - element type
 * @param array - input array
 * @returns a shuffled array that's different from the input when feasible
 */
export function arrayShuffleForce<T>(arr: T[]): T[] {
  while (arr.length > 1) {
    const copy = Array.from(arr)
    arrayShuffleInPlace(copy)
    if (!arrayIsEqual(arr, copy))
      return copy
  }
  return arr
}

/**
 * Return a random element from `array` using a secure random source if available.
 * @typeParam T - element type
 * @param array - input array (must be non-empty)
 * @returns a randomly selected element
 */
export function arrayRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(getSecureRandomIfPossible() * arr.length)]
}

/**
 * Return the maximum value from one or more nested arrays.
 * Uses the `>` operator for comparison.
 * @typeParam T - element type (should support `>` comparison)
 * @param arrays - nested arrays to search
 * @returns the maximum value or `undefined` if no elements present
 */
export function arrayMax<T>(...arrays: NestedArray<T>[]): T {
  return arrayFlatten(...arrays).reduce(
    (acc: T, value: T) => (acc != null ? (value > acc ? value : acc) : value),
    undefined as T,
  )
}

/**
 * Return the minimum value from one or more nested arrays.
 * Uses the `<` operator for comparison.
 * @typeParam T - element type (should support `<` comparison)
 * @param arrays - nested arrays to search
 * @returns the minimum value or `undefined` if no elements present
 */
export function arrayMin<T>(...arrays: NestedArray<T>[]): T {
  return arrayFlatten(...arrays).reduce(
    (acc: T, value: T) => (acc != null ? (value < acc ? value : acc) : value),
    undefined as T,
  )
}

/**
 * Sum all numbers in one or more nested arrays.
 * @param arrays - nested arrays of numbers
 * @returns the numeric sum (0 for empty input)
 */
export function arraySum(...arrays: NestedArray<number>[]): number {
  return arrayFlatten(...arrays).reduce((acc, value) => acc + value, 0)
}

/**
 * Compute the average of numbers across one or more nested arrays.
 * @param arrays - nested arrays of numbers
 * @returns arithmetic mean (NaN if there are no elements)
 */
export function arrayAvg(...arrays: NestedArray<number>[]): number {
  const flatArray = arrayFlatten(...arrays)
  return flatArray.reduce((acc, value) => acc + value, 0) / flatArray.length
}

/**
 * Split an array into chunks of `chunkLength` (last chunk may be smaller).
 * @typeParam T - element type
 * @param arr - input array
 * @param chunkLength - chunk size (positive integer)
 * @returns array of chunk arrays
 */
export function arrayBatches<T>(arr: T[], chunkLength: number): T[][] {
  const chunks = []
  let i = 0
  const n = arr.length
  while (i < n)
    chunks.push(arr.slice(i, (i += chunkLength)))
  return chunks
}

/**
 * Create an array of given `length` filled with `item` or the result of `item(index)`.
 * If `length` is <= 0 an empty array is returned.
 * @typeParam T - element type
 * @param length - desired length of the array
 * @param item - value to fill or a function producing a value per index
 * @returns newly created array of length `length`
 */
export function createArray<T>(
  length = 0,
  item?: T | ((index: number) => T), // todo remove optional
): T[] {
  if (length <= 0)
    return []
  const arr: T[] = Array.from({ length })
  for (let i = 0; i < length; i++)
    // @ts-expect-error xxx
    arr[i] = item instanceof Function ? item(i) : item
  return arr
}
