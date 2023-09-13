import { getSecureRandomIfPossible } from './math'

/**
 * CRDT compatible sorting with a single operation. Default name is `sort`
 * @param config
 * @param config.getter
 */
export function useSorted<S extends Record<string, any>>(
  config: {
    getter?: (item: S) => number
    // setter?: (item: S, value: number) => void
  } = {},
) {
  const {
    getter = (item: any): number => item.sort,
    // setter = (item: any, value) => (item.sort = value),
  } = config

  /**
   * Return sorted list from low to high.
   * @param items
   */
  function items<T extends S>(items: T[]): T[] {
    items.sort((a, b) => (getter(a) || 0) - (getter(b) || 0))
    return items
  }

  /**
   * Get a sort suitable for adding to start of list.
   * @param items
   */
  function start(items: S[]): number {
    return (
      items.reduce((acc, item) => Math.min(acc, getter(item) || 0), 0) - 1 - getSecureRandomIfPossible()
    )
  }

  /**
   * Get a sort suitable for adding to end of list.
   * @param items
   */
  function end(items: S[]): number {
    return (
      items.reduce((acc, item) => Math.max(acc, getter(item) || 0), 0) + 1 + getSecureRandomIfPossible()
    )
  }

  /**
   * Find a suitable value inbetween a lower and upper bound.
   * @param lower
   * @param upper
   */
  function between(lower?: number, upper?: number): number {
    if (lower == null)
      lower = (upper ?? 0) - 1
    if (upper == null)
      upper = (lower ?? 0) + 1

    const distance = upper - lower
    // if (distance === 0)

    const middle = lower + distance / 2
    const fuzzy = distance * 0.01 * (getSecureRandomIfPossible() - 0.5) // 1% fuzziness to avoid conflicts
    return middle + fuzzy
  }

  /**
   * Mainly for drag and drop movements, where an item has to be moved to another index. Respects its own move as well.
   * @param newIndex
   * @param oldIndex
   * @param sortableItems
   */
  function move(
    newIndex: number,
    oldIndex: number,
    sortableItems: S[],
  ): number {
    const count = sortableItems.length

    const moveLower = newIndex < oldIndex
    if (count <= 0 || newIndex >= count - 1)
      return end(sortableItems)

    if (newIndex <= 0)
      return start(sortableItems)

    // Make sure they are sorted
    sortableItems = items([...sortableItems])

    const step = moveLower ? -1 : 0
    const lower = getter(sortableItems[newIndex + step]) || 0
    const upper = getter(sortableItems[newIndex + step + 1]) || 0
    const distance = upper - lower
    if (distance === 0) {
      // Ugly list with no presets, make the best guess
      if (moveLower)
        return start(sortableItems)

      return end(sortableItems)
    }
    const middle = lower + distance / 2
    const fuzzy = distance * 0.01 * (getSecureRandomIfPossible() - 0.5) // 1% fuzziness to avoid conflicts
    return middle + fuzzy
  }

  return {
    start,
    end,
    between,
    move,
    items,
  }
}
