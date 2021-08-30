// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

// Get a sort_weight suitable for adding to top of list
// Original idea https://holtwick.de/en/blog/smart-table-reordering

export interface SortableItem {
  sort_weight: number
}

export function startSortWeight(items: SortableItem[]): number {
  return (
    items.reduce((acc, item) => Math.min(acc, item.sort_weight || 0), 0) -
    1 -
    Math.random()
  )
}

// Get a sort_weight suitable for adding to end of list
export function endSortWeight(items: SortableItem[]): number {
  return (
    items.reduce((acc, item) => Math.max(acc, item.sort_weight || 0), 0) +
    1 +
    Math.random()
  )
}

// The real magic
export function moveSortWeight(
  newIndex: number,
  oldIndex: number,
  items: SortableItem[]
): number {
  let count = items.length

  const moveLower = newIndex < oldIndex
  if (count <= 0 || newIndex >= count - 1) {
    return endSortWeight(items)
  }
  if (newIndex <= 0) {
    return startSortWeight(items)
  }

  // Make sure they are sorted
  items = sortedItems([...items])

  const step = moveLower ? -1 : 0
  const lower = items[newIndex + step].sort_weight || 0
  const upper = items[newIndex + step + 1].sort_weight || 0
  const distance = upper - lower
  if (distance === 0) {
    // Ugly list with no presets, make the best guess
    if (moveLower) {
      return startSortWeight(items)
    }
    return endSortWeight(items)
  }
  const middle = lower + distance / 2
  const fuzzy = distance * 0.01 * (Math.random() - 0.5) // 1% fuzziness to avoid conflicts
  return middle + fuzzy
}

export function sortedItems<T extends SortableItem>(items: T[]): T[] {
  items.sort((a, b) => (a.sort_weight || 0) - (b.sort_weight || 0))
  return items
}
