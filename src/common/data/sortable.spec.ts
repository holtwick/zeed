// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { arrayShuffleForce, arrayShuffleInPlace } from './array'
import type { SortableItem } from './sortable'
import {
  endSortWeight,
  moveSortWeight,
  sortedItems,
  startSortWeight,
} from './sortable'
import { last } from './utils'

interface SItem extends SortableItem {
  name: string
}

describe('sortable', () => {
  const list = [-0.2, -0.001, 0, 0.001, 2]
  const items = list.map((sort_weight, index) => ({ index, sort_weight }))

  it('should add correctly', () => {
    expect(startSortWeight(items)).toBeLessThan(list[0])
    expect(endSortWeight(items)).toBeGreaterThan(last(list) || 0)
  })

  it('should sort correctly', () => {
    const shuffledItems = arrayShuffleForce(items)
    expect(shuffledItems.map(el => el.sort_weight)).not.toEqual(list)
    expect(sortedItems(shuffledItems).map(el => el.sort_weight)).toEqual(list)
  })

  it('should move correctly', () => {
    let items: SItem[] = []
    for (let i = 0; i < 10; i++) {
      items.push({
        name: String(i),
        sort_weight: i,
      })
    }

    expect(
      sortedItems(items)
        .map(o => o.name)
        .join(''),
    ).toEqual('0123456789')

    const moveItem = items[8]
    moveItem.sort_weight = moveSortWeight(1, 8, items)

    expect(
      sortedItems(items)
        .map(o => o.name)
        .join(''),
    ).toEqual('0812345679')

    items = sortedItems(items)
    const moveItem2 = items[1]

    arrayShuffleInPlace(items)
    moveItem2.sort_weight = moveSortWeight(8, 1, items)

    expect(
      sortedItems(items)
        .map(o => o.name)
        .join(''),
    ).toEqual('0123456789')
  })
})
