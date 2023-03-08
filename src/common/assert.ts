import { getGlobalLoggerIfExists } from './log'

/**
  * Always throws.
  *
  * **Attention!** Due to a bug in typescript you will need to explicitly set the `LoggerInterface` type in
  * order to have the assertions having an effect on unreachable code. Example:
  *
  * ```ts
  * const log: LoggerInterface = Logger('xxx')
  * ```
  *
  * Bug https://github.com/microsoft/TypeScript/issues/50363#issuecomment-1219811447
  */
export function fatal(...messages: any[]): never {
  getGlobalLoggerIfExists()?.('assert')?.fatal(...messages)
  throw new Error(`${messages.map(String).join(' ')}`)
}

/**
   * Throws if condition is not truthy.
   *
   * **Attention!**  Due to a bug in typescript you will need to explicitly set the `LoggerInterface` type in
   * order to have the assertions having an effect on unreachable code. Example:
   *
   * ```ts
   * const log: LoggerInterface = Logger('xxx')
   * ```
   *
   * Bug https://github.com/microsoft/TypeScript/issues/50363#issuecomment-1219811447
   */
export function assert(condition: unknown, ...messages: any[]): asserts condition {
  if (condition == null || (typeof condition === 'number' && isNaN(condition)) || !condition)
    fatal(...messages)
}
