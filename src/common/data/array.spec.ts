// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import {
  arrayFilterInPlace,
  arrayFlatten,
  arrayIntersection,
  arrayIsEqual,
  arrayMax,
  arrayMin,
  arrayMinus,
  arrayRemoveElement,
  arrayShuffleForce,
  arraySorted,
  arraySortedNumbers,
  arraySymmetricDifference,
  arrayToggleInPlace,
  arrayUnion,
  createArray,
} from "./array"

describe("Array", () => {
  it("should remove items", () => {
    const r = arrayRemoveElement([1, 2, 3, 2, 4], 2)
    expect(r).toEqual([1, 3, 4])
  })

  it("should intersect", () => {
    expect(arrayIntersection([1, 1, 2, 2, 3], [2, 2, 3, 5, 6])).toEqual([2, 3])
    expect(arraySymmetricDifference([1, 1, 2, 2, 3], [2, 2, 3, 5, 6])).toEqual([
      1, 5, 6,
    ])
    expect(arrayUnion([1, 1, 2, 2, 3], [2, 2, 3, 5, 6], [7, 8])).toEqual([
      1, 2, 3, 5, 6, 7, 8,
    ])
    expect(arrayMinus([1, 1, 2, 2, 3], [2, 2, 3, 5, 6])).toEqual([1])
  })

  it("should sort", () => {
    let a: number[] = [9, 2, 1, 11, 8]

    expect(arraySorted(a, (l, r) => l - r)).toEqual([1, 2, 8, 9, 11])
    expect(arraySortedNumbers(a)).toEqual([1, 2, 8, 9, 11])
    expect(arraySorted(a)).toEqual([1, 2, 8, 9, 11])
    expect(a).toEqual([9, 2, 1, 11, 8])
  })

  it("should filter in place", () => {
    let array = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    arrayFilterInPlace(array, (el) => el % 2 === 0)
    expect(array).toEqual([2, 4, 6, 8])
    arrayToggleInPlace(array, 2)
    expect(array).toEqual([4, 6, 8])
    arrayToggleInPlace(array, 2)
    expect(array).toEqual([4, 6, 8, 2])
  })

  it("should compare arrays", () => {
    expect(arrayIsEqual([1, 2], [2, 1])).toBe(false)
    expect(arrayIsEqual([1, 2], [1, 2])).toBe(true)
    expect(arrayIsEqual([1, 2], [1, 2, undefined])).toBe(false)
    expect(arrayIsEqual([1, 2], [1, 2, 3])).toBe(false)
    expect(arrayIsEqual([1, 2, 3], [1, 2])).toBe(false)
  })

  it("should shuffle", () => {
    expect(arrayShuffleForce([1, 2, 3])).not.toEqual([1, 2, 3])
  })

  it("should min/max", () => {
    expect(arrayMin(1, [2, 3])).toBe(1)
    expect(arrayMax(1, [2, 3])).toBe(3)
    expect(arrayMin("1a", ["2b", "3c"])).toBe("1a")
    expect(arrayMax("1a", ["2b", "3c"])).toBe("3c")
  })

  it("should flatten", () => {
    expect(arrayFlatten(1, 2, [3, [4, 5]], 6)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it("should create array", () => {
    expect(createArray(10, (i) => i + 2)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ])
    expect(createArray(3)).toEqual([undefined, undefined, undefined])
    expect(createArray(3, "hello")).toEqual(["hello", "hello", "hello"])
    expect(createArray()).toEqual([])
  })
})
