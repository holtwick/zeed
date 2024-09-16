import type { DisposerFunction } from '../dispose-types'
import { getGlobalContext } from '../global'
import { DefaultLogger } from '../log/log'
import { safeTimeout } from '../timeout'

export type EmitterHandler = (...objs: any[]) => void
export type EmitterAllHandler<T = string> = (key: T, ...objs: any[]) => void

// For magic see https://www.npmjs.com/package/tiny-typed-emitter / License MIT
// https://stackoverflow.com/a/61609010/140927
// https://basarat.gitbook.io/typescript/main-1/typed-event
// https://github.com/andywer/typed-emitter#extending-an-emitter

// TODO: Allow symbols? https://github.com/sindresorhus/emittery

export declare type ListenerSignature<L> = {
  [E in keyof L]: (...args: any[]) => any
}

export declare interface DefaultListener {
  [k: string]: (...args: any[]) => any
}

interface EmitterSubscriber {
  fn: EmitterHandler // (...args: any[]) => any
  priority: number
}

export interface EmitterSubscriberOptions {
  priority?: number
}

export class Emitter<
  RemoteListener extends ListenerSignature<RemoteListener> = DefaultListener,
  LocalListener extends ListenerSignature<LocalListener> = RemoteListener,
> {
  private subscribers: Record<any, EmitterSubscriber[]> = {}
  private subscribersOnAny: any[] = []

  _logEmitter = DefaultLogger('zeed:emitter', 'warn')

  /** RPC like emitting of events. */
  call: RemoteListener = new Proxy<RemoteListener>({} as any, {
    get:
      (target: any, name: any) =>
        async (...args: any): Promise<boolean> =>
          await this.emit(name, ...args),
  })

  /**
   * Emits an event to all subscribers and executes their corresponding event handlers.
   *
   * @param event - The event to emit.
   * @param args - The arguments to pass to the event handlers.
   * @returns A promise that resolves to a boolean indicating whether the event was successfully emitted.
   */
  public async emit<U extends keyof RemoteListener>(event: U, ...args: Parameters<RemoteListener[U]>): Promise<boolean> {
    let ok = false

    try {
      const subscribers = (this.subscribers[event] || []) as EmitterSubscriber[]
      this._logEmitter.debug('emit', this?.constructor?.name, event, ...args, subscribers)

      this.subscribersOnAny.forEach(fn => fn(event, ...args))

      if (subscribers.length > 0) {
        const all = subscribers.map(({ fn }) => {
          try {
            return Promise.resolve(fn(...args))
          }
          catch (err) {
            this._logEmitter.warn('emit warning:', err)
          }
          return null
        }).filter(fn => fn != null)
        ok = true
        await Promise.all(all)
      }
    }
    catch (err) {
      this._logEmitter.error('emit exception', err)
    }
    return ok
  }

  public onAny(fn: EmitterHandler) {
    this.subscribersOnAny.push(fn)
  }

  public on<U extends keyof LocalListener>(
    event: U,
    fn: LocalListener[U],
    opt: EmitterSubscriberOptions = {},
  ): DisposerFunction {
    const { priority = 0 } = opt
    const subscribers = (this.subscribers[event] || [])
    const slen = subscribers.length
    const sobj = { fn, priority }
    if (slen <= 0) {
      this.subscribers[event] = [sobj]
    }
    else {
      let pos = slen
      for (let i = subscribers.length - 1; i >= 0; i--) {
        const s = subscribers[i]
        // Insert after last entry of same priority
        if (priority <= s.priority)
          break
        pos -= 1
      }
      subscribers.splice(pos, 0, sobj) // in place
    }
    return () => {
      this.off(event, fn)
    }
  }

  public onCall(handlers: Partial<LocalListener>) {
    for (const [name, handler] of Object.entries(handlers))
      this.on(name as any, handler as any)
  }

  public once<U extends keyof LocalListener>(
    event: U,
    listener: LocalListener[U],
  ): DisposerFunction {
    const onceListener = async (...args: any[]) => {
      this.off(event, onceListener as any)
      return await Promise.resolve(listener(...args))
    }
    this.on(event, onceListener as any)
    return () => {
      this.off(event, listener)
    }
  }

  public off<U extends keyof LocalListener>(
    event: U,
    listener: LocalListener[U],
  ): this {
    // log("off", key)
    this.subscribers[event] = (this.subscribers[event] || []).filter(f => listener && f.fn !== listener)
    return this
  }

  public removeAllListeners(): this {
    this.subscribers = {}
    return this
  }

  ///

  waitOn<U extends keyof LocalListener, R = Parameters<LocalListener[U]>[0]>(
    event: U,
    timeoutMS = 1000,
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      let disposeTimer: any

      const disposeListener = this.once(event, ((value): void => {
        disposeTimer?.()
        resolve(value)
      }) as LocalListener[U])

      disposeTimer = safeTimeout(() => {
        disposeListener()
        reject(new Error('Did not respond in time'))
      }, timeoutMS)
    })
  }

  // For compatibility reasons
  addEventListener = this.on.bind(this)
  removeEventListener = this.off.bind(this)
}

declare global {
  interface ZeedGlobalContext {
    emitter?: Emitter
  }

  interface ZeedGlobalEmitter {}
}

/** Global emitter that will listen even across modules */
export function getGlobalEmitter<T extends ListenerSignature<T> = ZeedGlobalEmitter>(): Emitter<T> {
  let emitter = getGlobalContext().emitter
  if (!emitter) {
    emitter = new Emitter()
    getGlobalContext().emitter = emitter
  }
  return emitter as any
}
