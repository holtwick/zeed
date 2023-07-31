import type { UseDispose } from './dispose-defer'

// https://blog.hediet.de/post/the_disposable_pattern_in_typescript
// todo adopt for `using` https://www.totaltypescript.com/typescript-5-2-new-keyword-using

export type DisposerFunction = () => any | Promise<any>

export type Disposer = DisposerFunction |
{
  dispose?: DisposerFunction | Promise<unknown>
  cleanup?: DisposerFunction | Promise<unknown> // deprecated, but used often in my old code
}

export interface Disposable {
  dispose: UseDispose
}
