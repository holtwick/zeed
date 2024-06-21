import { vi as jest } from 'vitest'
import { useDisposeWithUtils, useEventListener, useTimeout } from './dispose-utils'

describe('useTimeout', () => {
  it('should call the provided function after the specified timeout', () => {
    jest.useFakeTimers()

    const mockFn = jest.fn()
    const timeout = 1000

    useTimeout(mockFn, timeout)

    expect(mockFn).not.toBeCalled()

    jest.advanceTimersByTime(timeout)

    expect(mockFn).toBeCalled()
  })

  it('should cancel the timeout when the disposer function is called', () => {
    jest.useFakeTimers()

    const mockFn = jest.fn()
    const timeout = 1000

    const disposer = useTimeout(mockFn, timeout)

    expect(mockFn).not.toBeCalled()

    disposer()

    jest.advanceTimersByTime(timeout)

    expect(mockFn).not.toBeCalled()
  })

  it('should add event listener using "on" method if available', () => {
    const emitter = {
      on: jest.fn(),
      off: jest.fn(),
    }
    const eventName = 'click'
    const fn = jest.fn()
    const args = [1, 2, 3]

    const disposer = useEventListener(emitter, eventName, fn, ...args)

    expect(emitter.on).toBeCalledWith(eventName, fn, ...args)
    expect(emitter.off).not.toBeCalled()

    disposer()

    expect(emitter.off).toBeCalledWith(eventName, fn, ...args)
  })

  it('should add event listener using "on" method if available using using', () => {
    const emitter = {
      on: jest.fn(),
      off: jest.fn(),
    }
    const eventName = 'click'
    const fn = jest.fn()
    const args = [1, 2, 3]

    function helper() {
      using _ = useEventListener(emitter, eventName, fn, ...args) as any
      expect(emitter.on).toBeCalledWith(eventName, fn, ...args)
      expect(emitter.off).not.toBeCalled()
    }

    helper()

    expect(emitter.off).toBeCalledWith(eventName, fn, ...args)
  })

  it('should add event listener using "addEventListener" method if "on" method is not available', () => {
    const emitter = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }
    const eventName = 'click'
    const fn = jest.fn()
    const args = [1, 2, 3]

    const disposer = useEventListener(emitter, eventName, fn, ...args)

    expect(emitter.addEventListener).toBeCalledWith(eventName, fn, ...args)
    expect(emitter.removeEventListener).not.toBeCalled()

    disposer()

    expect(emitter.removeEventListener).toBeCalledWith(eventName, fn, ...args)
  })

  it('should return an empty disposer function if emitter is null', () => {
    const emitter = null
    const eventName = 'click'
    const fn = jest.fn()
    const args = [1, 2, 3]

    const disposer = useEventListener(emitter, eventName, fn, ...args)

    expect(disposer).toEqual(expect.any(Function))

    disposer() // Should not throw any error
  })

  it('should add timeout disposer to the dispose object', () => {
    jest.useFakeTimers()

    const mockFn = jest.fn()
    const timeout = 1000

    const dispose = useDisposeWithUtils()
    dispose.timeout(mockFn, timeout)

    expect(mockFn).not.toBeCalled()

    jest.advanceTimersByTime(timeout)

    expect(mockFn).toBeCalled()
  })

  it('should add interval disposer to the dispose object', () => {
    jest.useFakeTimers()

    const mockFn = jest.fn()
    const interval = 1000

    const dispose = useDisposeWithUtils()
    dispose.interval(mockFn, interval)

    expect(mockFn).not.toBeCalled()

    jest.advanceTimersByTime(interval)

    expect(mockFn).toBeCalled()
  })

  // it('should add interval pause disposer to the dispose object', () => {
  //   jest.useFakeTimers()

  //   const mockFn = jest.fn()
  //   const interval = 1000

  //   const dispose = useDisposeWithUtils()
  //   dispose.intervalPause(mockFn, interval)

  //   expect(mockFn).not.toBeCalled()

  //   jest.advanceTimersByTime(interval)

  //   expect(mockFn).not.toBeCalled()
  // })

  it('should add event listener disposer to the dispose object using "on" method', async () => {
    const emitter = {
      on: jest.fn(),
      off: jest.fn(),
    }
    const eventName = 'click'
    const fn = jest.fn()
    const args = [1, 2, 3]

    const dispose = useDisposeWithUtils()
    dispose.on(emitter, eventName, fn, ...args)

    expect(emitter.on).toBeCalledWith(eventName, fn, ...args)
    expect(emitter.off).not.toBeCalled()

    await dispose.dispose()

    expect(emitter.off).toBeCalledWith(eventName, fn, ...args)
  })

  it('should add event listener disposer to the dispose object using "addEventListener" method', async () => {
    const emitter = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }
    const eventName = 'click'
    const fn = jest.fn()
    const args = [1, 2, 3]

    const dispose = useDisposeWithUtils()
    dispose.on(emitter, eventName, fn, ...args)

    expect(emitter.addEventListener).toBeCalledWith(eventName, fn, ...args)
    expect(emitter.removeEventListener).not.toBeCalled()

    await dispose.dispose()

    expect(emitter.removeEventListener).toBeCalledWith(eventName, fn, ...args)
  })

  it('should return an empty disposer function if emitter is null 2', () => {
    const emitter = null
    const eventName = 'click'
    const fn = jest.fn()
    const args = [1, 2, 3]

    const dispose = useDisposeWithUtils()
    const disposer = dispose.on(emitter, eventName, fn, ...args)

    expect(disposer).toEqual(expect.any(Function))

    disposer!() // Should not throw any error
  })
})
