import { arrayShuffleForce, arrayShuffleInPlace, last } from '..'

import { useSorted } from './sorted'

interface SItem {
  name: string
  sort: number
}

describe('sorted', () => {
  const sorted = useSorted()

  const list = [-0.2, -0.001, 0, 0.001, 2]
  const items = list.map((sort, index) => ({ index, sort }))

  it('should add correctly', () => {
    expect(sorted.start(items)).toBeLessThan(list[0])
    expect(sorted.end(items)).toBeGreaterThan(last(list) || 0)
  })

  it('should sort correctly', () => {
    const shuffledItems = arrayShuffleForce(items)
    expect(shuffledItems.map(el => el.sort)).not.toEqual(list)
    expect(sorted.items(shuffledItems).map(el => el.sort)).toEqual(list)
  })

  it('should move correctly', () => {
    let items: SItem[] = []
    for (let i = 0; i < 10; i++) {
      items.push({
        name: String(i),
        sort: i,
      })
    }

    expect(
      sorted
        .items(items)
        .map(o => o.name)
        .join(''),
    ).toEqual('0123456789')

    const moveItem = items[8]
    moveItem.sort = sorted.move(1, 8, items)

    expect(
      sorted
        .items(items)
        .map(o => o.name)
        .join(''),
    ).toEqual('0812345679')

    items = sorted.items(items)
    const moveItem2 = items[1]

    arrayShuffleInPlace(items)
    moveItem2.sort = sorted.move(8, 1, items)

    expect(
      sorted
        .items(items)
        .map(o => o.name)
        .join(''),
    ).toEqual('0123456789')
  })

  it('should calculate between values', () => {
    const sorted = useSorted()
    const mid = sorted.between(1, 3)
    expect(mid).toBeGreaterThan(1)
    expect(mid).toBeLessThan(3)
    // lower undefined
    const mid2 = sorted.between(undefined, 5)
    expect(mid2).toBeLessThan(5)
    // upper undefined
    const mid3 = sorted.between(5, undefined)
    expect(mid3).toBeGreaterThan(5)
    // both undefined
    const mid4 = sorted.between(undefined, undefined)
    expect(typeof mid4).toBe('number')
  })

  it('should handle empty and single-item arrays', () => {
    const sorted = useSorted()
    expect(sorted.start([])).toBeLessThan(0)
    expect(sorted.end([])).toBeGreaterThan(0)
    expect(sorted.items([])).toEqual([])
    expect(sorted.start([{ sort: 5 }])).toBeLessThan(5)
    expect(sorted.end([{ sort: 5 }])).toBeGreaterThan(5)
  })

  it('should handle move edge cases', () => {
    const sorted = useSorted()
    // count <= 0
    expect(sorted.move(0, 0, [])).toBeGreaterThan(0)
    // newIndex >= count - 1
    const arr = [{ sort: 1 }, { sort: 2 }]
    expect(sorted.move(2, 0, arr)).toBeGreaterThan(2)
    // newIndex <= 0
    expect(sorted.move(0, 1, arr)).toBeLessThan(1)
    // distance === 0
    const arr2 = [{ sort: 1 }, { sort: 1 }]
    expect(typeof sorted.move(1, 0, arr2)).toBe('number')
  })
})
