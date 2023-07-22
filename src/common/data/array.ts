// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

/* eslint-disable no-cond-assign */

import type { NestedArray } from '../types'
import { getSecureRandomIfPossible } from './math'
import { cmp } from './orderby'

export function arrayUnique<T>(x: T[]): T[] {
  return x.filter((n: any, index: any) => x.indexOf(n) === index)
}

export function arrayMinus<T>(x: T[], y: T[]): T[] {
  return arrayUnique(x.filter((n: any) => !y.includes(n)))
}

export function arrayUnion<T>(...a: T[][]): T[] {
  return arrayUnique(a.reduce((acc: T[] = [], value) => acc.concat(value), []))
}

/** `[1,[2,3]]` becomes `[1,2,3]` */
export function arrayFlatten<T>(...list: NestedArray<T>[]): T[] {
  return (list as any).flat(Number.POSITIVE_INFINITY)
}

export function arrayIntersection<T>(x: T[], y: T[]): T[] {
  return arrayUnique<T>(x).filter((n: any) => y.includes(n))
}

export function arraySymmetricDifference<T>(x: T[], y: T[]): T[] {
  return arrayMinus(arrayUnion(x, y), arrayIntersection(x, y))
  // return arrayUnique(x.filter(n => !y.includes(n)).concat(y.filter(n => !x.includes(n))))
}

// export function arrayApply<T>(fn:  any, a: T[]): T[] {
//   return a.reduce(fn, [])
// }

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
export function arraySetElement<T>(arr: T[], el: T): T[] {
  if (!arr.includes(el))
    arr.push(el)
  return arr
}

// via https://stackoverflow.com/a/49587869 and Erwin
export function arrayFilterInPlace<T>(array: T[], fn: (el: T) => boolean): T[] {
  array.splice(0, array.length, ...array.filter(fn))
  return array
}

// via https://stackoverflow.com/a/49587869 and Erwin
export function arrayToggleInPlace<T>(array: T[], el: T): T[] {
  const index = array.findIndex(e => e === el)
  if (index >= 0)
    array.splice(index, 1)
  else array.push(el)
  return array
}

export function arrayEmptyInPlace<T>(array: T[]): T[] {
  array.splice(0, array.length)
  return array
}

export function arraySorted<T>(
  arr: Iterable<T> | ArrayLike<T>,
  cond: ((a: T, b: T) => number) | undefined = cmp,
): T[] {
  return Array.from(arr).sort(cond)
}

export function arraySortedNumbers(arr: number[]): number[] {
  return arraySorted(arr, (l: number, r: number) => l - r)
}

export function arrayIsEqual<T>(array1: T[], array2: T[]): boolean {
  return (
    array1.length === array2.length
    && array1.every((value, index) => value === array2[index])
  )
}

export function arrayShuffleInPlace<T>(array: T[]): T[] {
  array.sort(() => (getSecureRandomIfPossible() > 0.5 ? 1 : -1))

  // Alternative https://github.com/sindresorhus/array-shuffle/blob/main/index.js#L8
  // for (let index = array.length - 1; index > 0; index--) {
  //   const newIndex = Math.floor(Math.random() * (index + 1));
  //   [array[index], array[newIndex]] = [array[newIndex], array[index]];
  // }

  return array
}

export function arrayShuffle<T>(array: T[]): T[] {
  return arrayShuffleInPlace(Array.from(array))
}

/** Randomly shuffle the order of the array's elements. Force to have a different order if array has more than one element. */
export function arrayShuffleForce<T>(array: T[]): T[] {
  while (array.length > 1) {
    const copy = Array.from(array)
    arrayShuffleInPlace(copy)
    if (!arrayIsEqual(array, copy))
      return copy
  }
  return array
}

export function arrayRandomElement<T>(array: T[]): T {
  return array[Math.floor(getSecureRandomIfPossible() * array.length)]
}

export function arrayMax<T>(...array: NestedArray<T>[]): T {
  return arrayFlatten(array).reduce(
    (acc: T, value: T) => (acc != null ? (value > acc ? value : acc) : value),
    undefined as T,
  )
}

export function arrayMin<T>(...array: NestedArray<T>[]): T {
  return arrayFlatten(array).reduce(
    (acc: T, value: T) => (acc != null ? (value < acc ? value : acc) : value),
    undefined as T,
  )
}

export function arraySum(...array: NestedArray<number>[]): number {
  return arrayFlatten(array).reduce((acc, value) => acc + value, 0)
}

export function arrayAvg(...array: NestedArray<number>[]): number {
  const flatArray = arrayFlatten(array)
  return flatArray.reduce((acc, value) => acc + value, 0) / flatArray.length
}

export function arrayBatches<T>(array: T[], chunckLength: number): T[][] {
  const chunks = []
  let i = 0
  const n = array.length
  while (i < n)
    chunks.push(array.slice(i, (i += chunckLength)))
  return chunks
}

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
