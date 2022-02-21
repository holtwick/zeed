import { Emitter } from "../msg/emitter"
import { TaskEvents, TaskFn } from "./queue"

interface PoolConfig {
  maxParallel?: number
}

interface PoolTask<T> {
  id: string
  priority: number
  task: TaskFn<T>
  running: boolean
}

// todo: barrier
// todo: dependents

export function usePool<T = any>(config: PoolConfig = {}) {
  const { maxParallel = 3 } = config
  const events = new Emitter<TaskEvents>()

  let currentParallel = 0
  let priority = 0
  let tasks: Record<string, PoolTask<T>> = {}

  function performNext() {
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
        taskInfo.running = true
        ++currentParallel
        taskInfo
          .task()
          .then((r) => {
            if (taskInfo?.id) delete tasks[taskInfo.id]
            --currentParallel
            performNext()
          })
          .catch((err) => {
            if (taskInfo?.id) delete tasks[taskInfo.id]
            --currentParallel
            performNext()
          })
      }
    }
  }

  function cancel(id: string) {
    events.emit("didCancel")
    let taskInfo = tasks[id]
    if (taskInfo && taskInfo.running !== true) {
      delete tasks[id]
    }
  }

  function enqueue(id: string, task: TaskFn<T>) {
    if (tasks[id] == null) {
      tasks[id] = {
        id,
        task,
        priority: ++priority,
        running: false,
      }
      performNext()
    }
    return () => cancel(id)
  }

  return {
    events,
    cancel,
    enqueue,
  }
}

export type Pool = ReturnType<typeof usePool>
