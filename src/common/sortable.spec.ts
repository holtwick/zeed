// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { arrayShuffleForce } from "./array"
import { endSortWeight, sortedItems, startSortWeight } from "./sortable"
import { last } from "./utils"

describe("Sortable", () => {
  const list = [-0.2, -0.001, 0, 0.001, 2]
  const items = list.map((sort_weight, index) => ({ index, sort_weight }))

  it("should add correctly", () => {
    expect(startSortWeight(items)).toBeLessThan(list[0])
    expect(endSortWeight(items)).toBeGreaterThan(last(list) || 0)
  })

  it("should sort correctly", () => {
    let shuffledItems = arrayShuffleForce(items)
    expect(shuffledItems.map((el) => el.sort_weight)).not.toEqual(list)
    expect(sortedItems(shuffledItems).map((el) => el.sort_weight)).toEqual(list)
  })
})
