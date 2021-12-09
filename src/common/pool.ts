import { fakeWorkerPair, QueueTask, sortedOrderby } from "."

interface PoolConfig {
  maxParallel?: number
}

interface PoolTask<T> {
  id: string
  priority: number
  task: QueueTask<T>
  running: boolean
}

export function usePool<T = any>(config: PoolConfig = {}) {
  const { maxParallel = 3 } = config

  let currentParallel = 0
  let priority = 0
  let tasks: Record<string, PoolTask<T>> = {}

  function performNext() {
    if (currentParallel >= maxParallel) return
    let runningTasks = Object.values(tasks).filter((t) => !t.running)
    if (runningTasks.length > 0) {
      let taskInfo = runningTasks.reduce((prev, curr) =>
        prev.priority > curr.priority ? curr : prev
      )
      if (taskInfo) {
        taskInfo.running = true
        ++currentParallel
        taskInfo
          .task()
          .then((r) => {
            delete tasks[taskInfo.id]
            --currentParallel
            performNext()
          })
          .catch((err) => {
            delete tasks[taskInfo.id]
            --currentParallel
            performNext()
          })
      }
    }
  }

  function cancel(id: string) {
    let taskInfo = tasks[id]
    if (!taskInfo.running) {
      delete tasks[id]
    }
  }

  return {
    cancel,
    enqueue(id: string, task: QueueTask<T>) {
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
    },
  }
}
