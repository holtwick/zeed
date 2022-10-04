// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

// Can learn from here https://github.com/sindresorhus/p-queue

import type { LoggerInterface } from '../log-base'
import { LogLevel } from '../log-base'
import { Logger } from '../log'
import { uname } from '../uuid'
import { Emitter } from '../msg/emitter'

type TaskResolver = any

export type TaskFn<T = any> = () => Promise<T>

interface TaskInfo {
  name: string
  task: TaskFn
  resolve: TaskResolver
}

export interface TaskEvents {
  didUpdate(max: number, resolved: number): void
  didStart(max: number): void
  didCancel(): void
  didFinish(): void
  // didResolve(value: any): void
  // didReject(error: any): void
  // didPause(max: number): void
}

/** Guarentee serial execution of tasks. Able to wait, pause, resume and cancel all. */
export class SerialQueue extends Emitter<TaskEvents> {
  private queue: TaskInfo[] = []
  private waitToFinish: TaskResolver[] = []
  private currentTask?: Promise<any>
  private log: LoggerInterface
  private countMax = 0
  private countResolved = 0

  private paused = false

  name: string

  constructor(opt: { name?: string; logLevel?: LogLevel } = {}) {
    super()
    const { name = uname('queue'), logLevel } = opt
    this.name = name
    this.log = Logger(`zeed:queue:${name}`, logLevel ?? LogLevel.off)
  }

  private async performNext() {
    this.log('performNext, queue.length =', this.queue.length)

    if (this.currentTask != null) {
      this.log('performNext => skip while another task is running')
      return
    }

    if (this.paused) {
      this.log('performNext => skip while is paused')
      return
    }

    while (this.currentTask == null && !this.paused) {
      const info = this.queue.shift()
      this.log(`performNext => ${info?.name}`)

      if (info == null)
        break

      if (this.countResolved === 0)
        this.emit('didStart', this.countMax)

      const { name, task, resolve } = info
      this.currentTask = task()
      let result
      try {
        this.log.info(`start task ${name}`)
        result = await this.currentTask
        this.log(`finished task ${name} with result =`, result)
      }
      catch (err) {
        this.log.warn('Error performing task', err)
      }

      resolve(result)
      this.currentTask = undefined

      this.countResolved += 1
      this.emit('didUpdate', this.countMax, this.countResolved)
    }

    if (this.queue.length === 0) {
      this.emit('didFinish')
      this.countMax = 0
      this.countResolved = 0
    }

    while (this.waitToFinish.length > 0)
      this.waitToFinish.shift()()
  }

  /** Enqueue task to be executed when all other tasks are done. Except `immediate = true`. */
  async enqueue<T>(
    task: TaskFn<T>,
    opt: { immediate?: boolean; name?: string } = {},
  ): Promise<T> {
    const { immediate = false, name = uname(this.name) } = opt
    if (immediate) {
      this.log.info(`immediate execution ${name}`)
      return await task()
    }

    this.log(`enqueue ${name}`)
    return new Promise((resolve) => {
      this.queue.push({
        name,
        task,
        resolve,
      })

      this.countMax += 1
      this.emit('didUpdate', this.countMax, this.countResolved)

      this.performNext()
    })
  }

  /** If a task is already performing, execute immediately. Otherwise enqueue as usual. */
  async enqueueReentrant<T>(
    task: TaskFn<T>,
    opt: { name?: string } = {},
  ): Promise<T> {
    return this.enqueue(task, {
      immediate: this.currentTask != null,
      name: opt.name,
    })
  }

  /** Remove all tasks from queue that are not yet executing. */
  async cancelAll(_unblock = true) {
    this.log('cancelAll')
    this.emit('didCancel')
    const resolver = this.queue.map(task => task.resolve)
    this.queue = []
    resolver.forEach(r => r(undefined))
    await this.wait()
  }

  /** Pause execution after current task is finished. */
  async pause() {
    this.log('pause')
    this.paused = true
    await this.wait()
  }

  /** Resume paused queue. */
  resume() {
    this.log('resume')
    this.paused = false
    this.performNext()
  }

  /** Wait for all tasks to finish */
  async wait() {
    this.log('wait')
    if (this.currentTask == null && (this.queue.length === 0 || this.paused))
      return

    return new Promise((resolve) => {
      this.waitToFinish.push(resolve)
    })
  }

  public get isPaused(): boolean {
    return this.paused
  }

  public get hasTasks(): boolean {
    return this.queue.length !== 0
  }
}
