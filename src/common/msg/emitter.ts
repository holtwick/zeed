// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { getSecureRandomIfPossible } from "../data/math"
import { Disposable, DisposerFunction } from "../dispose-defer"
import { getGlobalContext } from "../global"
import { Logger } from "../log"
import { promisify } from "../exec/promise"

const log = Logger("zeed:emitter")

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

export declare type DefaultListener = {
  [k: string]: (...args: any[]) => any
}

export class Emitter<L extends ListenerSignature<L> = DefaultListener>
  implements Disposable
{
  subscribers: any = {}
  subscribersOnAny: any[] = []

  call: L = new Proxy<L>({} as any, {
    get:
      (target: any, name: any) =>
      (...args: any): any =>
        this.emit(name, ...args),
  })

  public async emit<U extends keyof L>(
    event: U,
    ...args: Parameters<L[U]>
  ): Promise<boolean> {
    let ok = false
    try {
      let subscribers = (this.subscribers[event] || []) as EmitterHandler[]
      // log.debug("emit", this?.constructor?.name, event, ...args, subscribers)

      this.subscribersOnAny.forEach((fn) => fn(event, ...args))

      if (subscribers.length > 0) {
        let all = subscribers.map((fn) => {
          try {
            return promisify(fn(...args))
          } catch (err) {
            log.warn("emit warning:", err)
          }
        })
        ok = true
        await Promise.all(all)
      }
    } catch (err) {
      log.error("emit exception", err)
    }
    return ok
  }

  public onAny(fn: EmitterHandler) {
    this.subscribersOnAny.push(fn)
  }

  public on<U extends keyof L>(event: U, listener: L[U]): DisposerFunction {
    let subscribers = (this.subscribers[event] || []) as EmitterHandler[]
    subscribers.push(listener)
    this.subscribers[event] = subscribers
    return () => {
      this.off(event, listener)
    }
  }

  public onCall(handlers: Partial<L>) {
    for (const [name, handler] of Object.entries(handlers)) {
      this.on(name as any, handler as any)
    }
  }

  public once<U extends keyof L>(event: U, listener: L[U]): DisposerFunction {
    const onceListener = async (...args: any[]) => {
      this.off(event, onceListener as any)
      return await promisify(listener(...args))
    }
    this.on(event, onceListener as any)
    return () => {
      this.off(event, listener)
    }
  }

  public off<U extends keyof L>(event: U, listener: L[U]): this {
    // log("off", key)
    this.subscribers[event] = (this.subscribers[event] || []).filter(
      (f: any) => listener && f !== listener
    )
    return this
  }

  public removeAllListeners(event?: keyof L): this {
    this.subscribers = {}
    return this
  }

  dispose() {
    this.subscribers = {}
    this.subscribersOnAny = []
  }
}

declare global {
  interface ZeedGlobalContext {
    emitter?: Emitter
  }

  interface ZeedGlobalEmitter {}
}

/** Global emitter that will listen even across modules */
export function getGlobalEmitter(): Emitter<ZeedGlobalEmitter> {
  let emitter = getGlobalContext().emitter
  if (!emitter) {
    emitter = new Emitter()
    getGlobalContext().emitter = emitter
  }
  return emitter as any
}

// This can be used as a global messaging port to connect loose
// parts of your app
export const messages = new Emitter()

// For debugging

interface LazyEvent {
  key: string
  obj: any
}

export function lazyListener(
  emitter: any,
  listenerKey?: string
): (key?: string, skipUnmatched?: boolean) => Promise<any> {
  const name = Math.round(getSecureRandomIfPossible() * 100)

  var events: LazyEvent[] = []
  var lazyResolve: (() => void) | undefined

  const incoming = (key: string, obj: any) => {
    let ev = { key, obj }
    // debug(name, "  lazy push", ev)
    events.push(ev)
    lazyResolve && lazyResolve()
  }

  if (listenerKey) {
    if (emitter.on) {
      emitter.on(listenerKey, (obj: any) => {
        incoming(listenerKey, obj)
      })
    } else if (emitter.addEventListener) {
      emitter.addEventListener(listenerKey, (obj: any) => {
        incoming(listenerKey, obj)
      })
    } else {
      log.error(name, "Cannot listen to key")
    }
  } else {
    if (emitter.onAny) {
      emitter.onAny((key: string, obj: any) => {
        incoming(key, obj)
      })
    } else {
      log.error(name, "cannot listen to all for", emitter)
    }
  }

  let on = (key?: string, skipUnmatched: boolean = true): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!key) {
        key = listenerKey
        if (!key) {
          if (events.length) {
            // no key specified? just take the first one!
            key = events[0].key
          }
        }
      }
      // debug(name, "lazy resolve on2", key, skipUnmatched, events)
      lazyResolve = () => {
        // debug(name, "lazy resolve", key, listenerKey, events)
        while (events.length > 0) {
          let ev = <LazyEvent>events.shift()
          // debug(name, "  lazy analyze", ev)
          if (ev.key === key) {
            lazyResolve = undefined
            resolve(ev.obj)
          } else {
            if (skipUnmatched) {
              log.warn(name, `Unhandled event ${key} with value: ${ev.obj}`)
              continue
            }
            reject(`Expected ${key}, but found ${ev.key} with value=${ev.obj}`)
            log.error(name, `Unhandled event ${key} with value: ${ev.obj}`)
          }
          break
        }
      }
      lazyResolve()
    })
  }

  return on
}
