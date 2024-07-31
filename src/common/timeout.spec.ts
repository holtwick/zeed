import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { safeTimeout } from './timeout'

describe('safeTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers() // Use Vitest's fake timers
  })

  afterEach(() => {
    vi.useRealTimers() // Restore real timers after each test
  })

  it('should call the provided function after the specified delay', () => {
    const mockFn = vi.fn()
    const delay = 1000

    const dispose = safeTimeout(mockFn, delay)

    // Fast-forward time
    vi.advanceTimersByTime(delay)

    expect(mockFn).toHaveBeenCalledTimes(1)

    // Clean up
    dispose()
  })

  it('should allow the timer to be disposed of before it executes', () => {
    const mockFn = vi.fn()
    const delay = 1000

    const dispose = safeTimeout(mockFn, delay)

    // Dispose of the timer before the delay
    dispose()

    // Fast-forward time
    vi.advanceTimersByTime(delay)

    expect(mockFn).toHaveBeenCalledTimes(0)
  })

  it('should allow multiple calls to disposeTimer', () => {
    const mockFn = vi.fn()
    const delay = 1000

    const dispose = safeTimeout(mockFn, delay)

    // Dispose of the timer
    dispose()
    // Call dispose again
    dispose()

    // Fast-forward time
    vi.advanceTimersByTime(delay)

    expect(mockFn).toHaveBeenCalledTimes(0)
  })

  it('should work with a zero delay', () => {
    const mockFn = vi.fn()

    const dispose = safeTimeout(mockFn, 0)

    // Fast-forward time
    vi.advanceTimersByTime(0)

    expect(mockFn).toHaveBeenCalledTimes(1)

    // Clean up
    dispose()
  })
})
