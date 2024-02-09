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
})
