// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

// Inspired by https://github.com/diamondio/better-queue

import { Logger } from "../../log"
import { LogLevel } from "../../log-base"
import { uuid } from "../../uuid"
// import { Emitter } from "./emitter"
// import { cloneObject } from "./utils"
// import { Channel } from "./channel"

const log = Logger("zeed:mq")
log.level = LogLevel.off

interface Task {
  id: string
  info: any
  added?: number
  started?: number
  ended?: number
  // cancelled: false,
  response?: string
}

export function now() {
  return new Date().getTime()
}

export class TaskHandler {
  _tasks: Task[] = []
  _name: string
  _fn: Function
  _waitFn?: Function
  _delayTimer: any

  // Options
  defer = 0
  debounce = 0
  persist = false
  latest = false
  batch = 1

  filter?: (v: any) => boolean = undefined
  sort?: any
  merge?: any

  queue?: TaskQueue

  constructor(
    name: string,
    fn: (info: any) => any,
    {
      queue = null,
      defer = 0,
      debounce = 0,
      persist = false,
      latest = false,
      batch = 1,
      filter = undefined,
      sort = undefined,
      merge = undefined,
    } = {}
  ) {
    this._name = name

    this._fn = async (task: {
      started: number
      info: any
      ended: number
      added: number
      id: any
    }) => {
      // , backChannel?
      // log(`Task for ${name} starts.`)
      let error, result
      task.started = now()
      try {
        result = fn(task.info)
        if (result instanceof Promise) {
          result = await result
        }
      } catch (err) {
        error = err
        log("Execution error", err)
      }
      task.ended = now()
      log(
        `*** Task for ${name} finished. ${(task.started - task.added).toFixed(
          2
        )}ms until start. ${(task.ended - task.started).toFixed(
          2
        )}ms execution time. Info=${result}, error=${error}`
      )
      this.remove(task.id)

      this.response(task, result, error)
    }

    this.queue = queue || undefined
    this.defer = defer
    this.debounce = debounce
    this.persist = persist
    this.latest = latest
    this.batch = batch
    this.filter = filter
    this.sort = sort
    this.merge = merge

    this._restore()
  }

  response(task: Task, info: any, error: any) {
    if (task.response && this.queue) {
      this.queue.emit(task.response, {
        info,
        error,
      })
    }
  }

  isEmpty() {
    const empty = this._tasks.filter((task) => task.started == null).length <= 0
    // log('isEmpty', empty)
    return empty
  }

  remove(taskID: string) {
    let index = this._tasks.findIndex((task) => task.id === taskID)
    if (index !== -1) this._tasks.slice(index, 1)
  }

  async _performNext() {
    log("perform next")
    const max = Math.max(1, this.batch)

    let currentTasks = this._tasks
      .filter((task) => task.ended == null)
      .slice(0, max)
      .map((task) => this._fn(task)) // error handling
    log("current tasks", currentTasks)
    await Promise.all(currentTasks)

    this._delayTimer = null
    if (!this.isEmpty()) {
      log("perform enqueued for next batch")
      this._delayTimer = setTimeout(() => this._performNext(), this.debounce)
    } else {
      log("perform finished, now empty")
      if (this._waitFn) {
        this._waitFn()
        this._waitFn = undefined
      }
    }
  }

  // combine? merge?
  // distinct? removeSame?

  async force() {
    clearTimeout(this._delayTimer)
    this.batch = 99999 // todo
    await this._performNext()
  }

  _persist() {
    if (this.persist) {
      localStorage.setItem(
        `mq-handler-${this._name}`,
        JSON.stringify(this._tasks, null, 2)
      )
    }
  }

  _restore() {
    if (this.persist) {
      try {
        this._tasks = JSON.parse(
          localStorage.getItem(`mq-handler-${this._name}`) || "{}"
        )
      } catch (err) {
        console.error("Exception:", err)
      }
    }
  }

  // pendingTasks() {
  //   return this._
  // }

  add(info: any, { id = uuid(), ...props } = {}): Task {
    const wasEmpty = this.isEmpty()

    let task: Task = {
      ...props,
      id,
      info,
      added: now(),
    }

    this._tasks.push(task)

    if (this.latest) {
      this._tasks = [task] // skip .started
    } else {
      let filterFn = this.filter
      if (filterFn) {
        let tasks = []
        for (let task of this._tasks) {
          if (!task.started && !filterFn(task.info)) continue
          tasks.push(task)
        }
        this._tasks = tasks //  this._tasks.filter(task => filterFn(task.info))
      }
      // const mergeFn = this.merge
      // if (mergeFn) {
      //   let prev
      //   let tasks = []
      //   for(let task of this._tasks) {
      //     if (!task.started) {
      //
      //     }
      //   }
      //   this._tasks = this._tasks.reduce()
      // }
    }

    log(`added to ${this._name}: ${info}`)
    if (wasEmpty) {
      setTimeout(() => this._performNext(), 0) // immidiate like
    }
    return task
  }

  async wait() {
    if (this.isEmpty()) {
      return Promise.resolve()
    }
    return new Promise((resolve, reject) => {
      this._waitFn = resolve
    })
  }

  // pause
  // resume

  destroy() {
    this.queue = undefined // circular reference
  }
}

export class TaskQueue {
  _name
  _handlers: { [key: string]: any } = {}

  constructor({ name = uuid() } = {}) {
    this._name = name
  }

  on(
    name: string,
    fn: (info: any) => any,
    opt?:
      | {
          queue?: null | undefined
          defer?: number | undefined
          debounce?: number | undefined
          persist?: boolean | undefined
          latest?: boolean | undefined
          batch?: number | undefined
          filter?: null | undefined
          sort?: null | undefined
          merge?: null | undefined
        }
      | undefined
  ): TaskHandler {
    let handler = new TaskHandler(name, fn, {
      ...opt,
      // @ts-ignore
      queue: this || undefined,
    })
    this._handlers[name] = handler
    return handler
  }

  off(name: string) {
    this._handlers[name]?.destroy()
    this._handlers[name] = null
  }

  once(name: string, fn: (info: any) => any) {
    this.on(name, (info) => {
      this.off(name)
      return fn(info)
    })
  }

  // Returns the Task if handler was available
  _emit(name: string | number, info: any, props = {}) {
    let handler = this._handlers[name]
    if (handler) {
      return handler.add(info, props)
    }
    log(`No handler found for ${name}`)
  }

  emit(name: string, info: any, props = {}) {
    return this._emit(name, info, props)
  }

  // fetchOne, fetchMany
  async fetch(name: string, info: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = uuid()
      const response = `--${name}-${id}`
      this.once(response, ({ info, error }) => {
        log("response", info, error)
        if (error) reject(error)
        else resolve(info)
      })
      this.emit(name, info, { response })
    })
  }

  handler(name: string): TaskHandler | undefined {
    return this._handlers[name]
  }

  async wait(name?: string): Promise<void> {
    if (!name) {
      // @ts-ignore
      return Promise.all(
        Object.keys(this._handlers).map((name) => this.wait(name))
      )
    }
    let handler = this.handler(name)
    if (handler) {
      await handler.wait()
    }
  }
}

// export class ChannelTaskQueue extends TaskQueue {
//   _channel: Channel

//   constructor(channel: Channel) {
//     super()
//     this._channel = channel
//     log("Subscribe", this._name, this._channel._name)
//     this._channel.subscribe(
//       ({ name, info, props }: { name: string; info: any; props: any }) => {
//         log(
//           "Message via channel",
//           name,
//           info,
//           this._name,
//           Object.keys(this._handlers)
//         )
//         this._emit(name, info, props)
//       }
//     )
//   }

//   emit(name: string, info: Json, props?: { response: string }) {
//     log("Publish on channel", name, info, this._name, this._channel._name) // , Object.keys(this._handlers))
//     this._channel.publish({ name, info, props: props || null })
//   }
// }
