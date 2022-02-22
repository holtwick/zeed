import { Emitter } from "../msg/emitter"
import { TaskFn } from "./queue"

interface PoolConfig {
  maxParallel?: number
}

interface PoolTask<T> {
  id: string
  priority: number
  task: TaskFn<T>
  running: boolean
}

export interface PoolTaskEvents {
  didUpdate(max: number, resolved: number): void
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

  function performNext() {
    events.emit("didUpdate", countMax, countResolved)
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
      if (taskInfo) {
        const id = taskInfo.id
        taskInfo.running = true
        ++currentParallel
        events.emit("didStart", id)
        taskInfo
          .task()
          .then((r) => {
            delete tasks[id]
            events.emit("didResolve", id, r)
            --currentParallel
            ++countResolved
            performNext()
          })
          .catch((err) => {
            delete tasks[id]
            events.emit("didReject", id, err)
            --currentParallel
            ++countResolved
            performNext()
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
      events.emit("didUpdate", countMax, countResolved)
    }
  }

  function cancelAll() {
    Object.keys(tasks).forEach(cancel)
  }

  function enqueue(id: string, task: TaskFn<T>) {
    if (tasks[id] == null) {
      tasks[id] = {
        id,
        task,
        priority: ++priority,
        running: false,
      }
      ++countMax
      performNext()
    }
    return () => cancel(id)
  }

  return {
    events,
    cancel,
    cancelAll,
    enqueue,
  }
}

export type Pool = ReturnType<typeof usePool>