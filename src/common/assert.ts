import { getGlobalLoggerIfExists } from './log'

/**
 * Always throws.
 * @param {...any} messages
 */
export function fatal(...messages: any[]): never {
  getGlobalLoggerIfExists()?.('assert')?.fatal(...messages)
  throw new Error(`${messages.map(String).join(' ')}`)
}

/**
 * Throws if condition is not truthy.
 * @param condition
 * @param {...any} messages
 */
export function assert(condition: unknown, ...messages: any[]): asserts condition {
  if (condition == null || (typeof condition === 'number' && Number.isNaN(condition)) || !condition)
    fatal(...messages)
}

/**
 * Alias for `assert` for better differentiation to unit test's assert function.
 * @param condition
 * @param {...any} messages
 */
export function assertCondition(condition: unknown, ...messages: any[]): asserts condition {
  assert(condition, ...messages)
}
