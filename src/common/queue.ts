// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

// Can learn from here https://github.com/sindresorhus/p-queue

import { LoggerInterface, LogLevel } from "../common/log-base"
import { Logger } from "../common/log"
import { uname } from "./uuid"
import { Emitter } from "./msg/emitter"

const log = Logger("zeed:queue")

type QueueTaskResolver = any
export type QueueTask<T = any> = () => Promise<T>

interface QueueTaskInfo {
  name: string
  task: QueueTask
  resolve: QueueTaskResolver
}

interface SerialQueueEvents {
  didUpdate(max: number, resolved: number): void
  didStart(max: number): void
  didCancel(max: number): void
  didFinish(max: number): void
  // didPause(max: number): void
}

/** Guarentee serial execution of tasks. Able to wait, pause, resume and cancel all. */
export class SerialQueue extends Emitter<SerialQueueEvents> {
  private queue: QueueTaskInfo[] = []
  private isPaused: boolean = false
  private waitToFinish: QueueTaskResolver[] = []
  private currentTask?: Promise<any>
  private log: LoggerInterface
  private max: number = 0
  private resolved: number = 0

  name: string

  constructor(opt: { name?: string; logLevel?: LogLevel } = {}) {
    super()
    const { name = uname("queue"), logLevel } = opt
    this.name = name
    this.log = Logger(`zeed:queue:${name}`)
    this.log.level = logLevel ?? LogLevel.off
  }

  private async performNext() {
    this.log(`performNext, queue.length =`, this.queue.length)

    if (this.currentTask != null) {
      this.log(`performNext => skip while another task is running`)
      return
    }

    if (this.isPaused) {
      this.log(`performNext => skip while is paused`)
      return
    }

    while (this.currentTask == null && !this.isPaused) {
      let info = this.queue.shift()
      this.log(`performNext => ${info?.name}`)

      if (info == null) {
        break
      }

      if (this.resolved === 0) {
        this.emit("didStart", this.max)
        this.emit("didUpdate", this.max, 0)
      }

      const { name, task, resolve } = info
      this.currentTask = task()
      let result = undefined
      try {
        this.log.info(`start task ${name}`)
        result = await this.currentTask
        this.log(`finished task ${name} with result =`, result)
      } catch (err) {
        log.warn("Error performing task", err)
      }

      resolve(result)
      this.currentTask = undefined

      this.resolved += 1
      this.emit("didUpdate", this.max, this.resolved)
    }

    if (this.queue.length === 0) {
      this.emit("didFinish", this.max)
      this.max = 0
      this.resolved = 0
    }

    while (this.waitToFinish.length > 0) {
      this.waitToFinish.shift()()
    }
  }

  /** Enqueue task to be executed when all other tasks are done. Except `immediate = true`. */
  async enqueue<T>(
    task: QueueTask<T>,
    opt: { immediate?: boolean; name?: string } = {}
  ): Promise<T> {
    const { immediate = false, name = uname(this.name) } = opt
    if (immediate) {
      this.log.info(`immediate execution ${name}`)
      return await task()
    }
    this.max += 1
    this.log(`enqueue ${name}`)
    return new Promise((resolve) => {
      this.queue.push({
        name,
        task,
        resolve,
      })
      this.performNext()
    })
  }

  /** If a task is already performing, execute immediately. Otherwise enqueue as usual. */
  async enqueueReentrant<T>(
    task: QueueTask<T>,
    opt: { name?: string } = {}
  ): Promise<T> {
    return this.enqueue(task, {
      immediate: this.currentTask != null,
      name: opt.name,
    })
  }

  /** Remove all tasks from queue that are not yet executing. */
  async cancelAll(unblock = true) {
    this.log(`cancelAll`)
    this.emit("didCancel", this.queue.length)
    let resolver = this.queue.map((task) => task.resolve)
    this.queue = []
    resolver.forEach((r) => r(undefined))
    await this.wait()
  }

  /** Pause execution after current task is finished. */
  async pause() {
    this.log(`pause`)
    this.isPaused = true
    await this.wait()
  }

  /** Resume paused queue. */
  resume() {
    this.log(`resume`)
    this.isPaused = false
    this.performNext()
  }

  /** Wait for all tasks to finish */
  async wait() {
    this.log(`wait`)
    if (
      this.currentTask == null &&
      (this.queue.length === 0 || this.isPaused)
    ) {
      return
    }
    return new Promise((resolve) => {
      this.waitToFinish.push(resolve)
    })
  }
}
