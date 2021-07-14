// Can learn from here https://github.com/sindresorhus/p-queue

import { Logger } from "../common/log.js"
const log = Logger("queue")

type QueueTaskResolver = any
type QueueTask<T = any> = () => Promise<T>

interface QueueTaskInfo {
  task: QueueTask
  resolve: QueueTaskResolver
}

export class SerialQueue {
  private queue: QueueTaskInfo[] = []

  private isPaused: boolean = false
  private waitToFinish: QueueTaskResolver[] = []

  private currentTask?: Promise<any>

  private async performNext() {
    if (this.currentTask != null) {
      return
    }

    while (this.currentTask == null && !this.isPaused) {
      let info = this.queue.shift()
      if (info == null) {
        break
      }
      const { task, resolve } = info
      this.currentTask = task()
      let result = undefined
      try {
        result = await this.currentTask
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
    return new Promise((resolve) => {
      this.queue.push({ task, resolve })
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
    let resolver = this.queue.map((task) => task.resolve)
    this.queue = []
    resolver.forEach((r) => r(undefined))
    await this.wait()
  }

  async pause() {
    this.isPaused = true
    await this.wait()
  }

  resume() {
    this.isPaused = false
    this.performNext()
  }

  async wait() {
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
