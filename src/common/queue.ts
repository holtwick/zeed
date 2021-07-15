// Can learn from here https://github.com/sindresorhus/p-queue

import { Logger } from "../common/log.js"
import { uname } from "./uuid.js"

const log = Logger("queue")

type QueueTaskResolver = any
type QueueTask<T = any> = () => Promise<T>

interface QueueTaskInfo {
  name: string
  task: QueueTask
  resolve: QueueTaskResolver
}

export class SerialQueue {
  private queue: QueueTaskInfo[] = []

  private isPaused: boolean = false
  private waitToFinish: QueueTaskResolver[] = []

  private currentTask?: Promise<any>

  private debug: boolean

  name: string

  constructor(opt: { name?: string; debug?: boolean } = {}) {
    const { name = uname("queue"), debug = false } = opt
    this.debug = debug
    this.name = name
  }

  private async performNext() {
    this.debug && log(`performNext, queue.length =`, this.queue.length)

    if (this.currentTask != null) {
      this.debug && log(`performNext => skip while another task is running`)
      return
    }

    if (this.isPaused) {
      this.debug && log(`performNext => skip while is paused`)
      return
    }

    while (this.currentTask == null && !this.isPaused) {
      let info = this.queue.shift()
      this.debug && log(`performNext => ${info?.name}`)

      if (info == null) {
        break
      }

      const { name, task, resolve } = info
      this.currentTask = task()
      let result = undefined
      try {
        this.debug && log(`start ${name}`)
        result = await this.currentTask
        this.debug && log(`end ${name} with result =`, result)
      } catch (err) {
        log.error("Error performing task", err)
      }

      resolve(result)
      this.currentTask = undefined
    }

    while (this.waitToFinish.length > 0) {
      this.waitToFinish.shift()()
    }
  }

  async enqueue<T>(task: QueueTask<T>): Promise<T> {
    const name = uname(this.name)
    this.debug && log(`enqueue ${name}`)
    return new Promise((resolve) => {
      this.queue.push({
        name,
        task,
        resolve,
      })
      this.performNext()
    })
  }

  // async enqueueReentrant<T>(task: QueueTask<T>): Promise<T> {
  //   return new Promise((resolve) => {
  //     this.queue.push({ task, resolve })
  //     this.performNext()
  //   })
  // }

  async cancelAll(unblock = true) {
    this.debug && log(`cancelAll`)
    let resolver = this.queue.map((task) => task.resolve)
    this.queue = []
    resolver.forEach((r) => r(undefined))
    await this.wait()
  }

  async pause() {
    this.debug && log(`pause`)
    this.isPaused = true
    await this.wait()
  }

  resume() {
    this.debug && log(`resume`)
    this.isPaused = false
    this.performNext()
  }

  async wait() {
    this.debug && log(`wait`)
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
