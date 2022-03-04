import { Emitter } from "../msg/emitter"
import { uuid } from "../uuid"
import { TaskFn } from "./queue"

interface PoolConfig {
  maxParallel?: number
}

type PoolTaskFn<T = any> = (taskInfo?: PoolTask<T>) => Promise<T>

interface PoolTask<T> {
  readonly id: string
  readonly task: PoolTaskFn<T>
  readonly done: Function
  running: boolean
  priority: number
  max: number
  resolved: number
}

export interface PoolTaskEvents {
  didUpdate(
    max: number,
    resolved: number,
    presentMax: number,
    presentResolved: number
  ): void
  didStart(id: string): void
  didCancel(id: string): void
  didFinish(): void
  didResolve(id: string, value: any): void
  didReject(id: string, error: any): void
}

// todo: barrier
// todo: dependents

export function usePool<T = any>(config: PoolConfig = {}) {
  const { maxParallel = 3 } = config
  const events = new Emitter<PoolTaskEvents>()

  let countMax = 0
  let countResolved = 0
  let currentParallel = 0
  let priority = 0
  let tasks: Record<string, PoolTask<T>> = {}

  function didFinish() {
    events.emit("didFinish")
    countMax = 0
    countResolved = 0
  }

  function didUpdate() {
    let presentMax = 0
    let presentResolved = 0
    for (const { max, resolved } of Object.values(tasks)) {
      presentMax += max
      presentResolved += Math.min(max, resolved)
    }
    events.emit(
      "didUpdate",
      countMax,
      countResolved,
      presentMax,
      presentResolved
    )
  }

  function performNext() {
    didUpdate()
    if (countMax > 0 && countMax === countResolved) didFinish()
    if (currentParallel >= maxParallel) return
    let waitingTasks = Object.values(tasks).filter((t) => !t.running)
    if (waitingTasks.length > 0) {
      let taskInfo: PoolTask<T> | undefined
      for (let t of waitingTasks) {
        // fifo
        if (taskInfo == null || t.priority < taskInfo.priority) {
          taskInfo = t
        }
      }
      if (taskInfo != null) {
        const id = taskInfo.id
        const done = taskInfo.done
        taskInfo.running = true
        ++currentParallel
        events.emit("didStart", id)

        const taskFinished = () => {
          if (taskInfo) {
            taskInfo.resolved = taskInfo.max
          }
          --currentParallel
          ++countResolved
          performNext()
        }

        taskInfo
          .task(taskInfo)
          .then((r) => {
            delete tasks[id]
            events.emit("didResolve", id, r)
            done(r)
            taskFinished()
          })
          .catch((err) => {
            delete tasks[id]
            events.emit("didReject", id, err)
            done()
            taskFinished()
          })
      }
    }
  }

  function cancel(id: string) {
    let taskInfo = tasks[id]
    if (taskInfo && taskInfo.running !== true) {
      delete tasks[id]
      ++countResolved
      events.emit("didCancel", id)
      didUpdate()
    }
  }

  function cancelAll() {
    Object.keys(tasks).forEach(cancel)
  }

  function enqueue(
    task: TaskFn<T>,
    config: {
      id?: string
    } = {}
  ) {
    let done: any
    let promise: Promise<any> = new Promise((resolve) => (done = resolve))
    let id = config.id ?? uuid()
    if (tasks[id] == null) {
      tasks[id] = {
        id,
        task,
        priority: ++priority,
        running: false,
        max: 1,
        resolved: 0,
        done,
      }
      ++countMax
      performNext()
    }
    return {
      id,
      promise,
      dispose: () => cancel(id),
      cancel: () => cancel(id),
    }
  }

  return {
    events,
    cancel,
    cancelAll,
    enqueue,
    dispose: cancelAll,
  }
}

export type Pool = ReturnType<typeof usePool>
