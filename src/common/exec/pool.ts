import { Emitter } from '../msg/emitter'
import { uuid } from '../uuid'
import { createPromise } from './promise'

interface PoolConfig {
  maxParallel?: number
}

export type PoolTaskFn<T = any> = (taskInfo?: PoolTask<T>) => Promise<T>

export enum PoolTaskState {
  waiting,
  running,
  finished,
}

/** Task */
export interface PoolTask<T> {
  readonly id: string
  readonly task: PoolTaskFn<T>
  readonly done: Function
  readonly setMax: (max: number) => void
  readonly setResolved: (resolved: number) => void
  readonly incResolved: (inc?: number) => void
  state: PoolTaskState
  priority: number
  /** Same groups are executed only one at a time */
  group?: string
  max: number
  resolved: number
  result?: T
  payload?: unknown
}

export enum PoolTaskIdConflictResolution {
  /** Tasks with same `id` are replaced. Last wins */
  replace,
  /** Tasks with same `id` ??? */
  memoize,
  /** Tasks with same `id` throw error */
  error,
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
  const tasks: Record<string, PoolTask<T>> = {}

  // const [allFinishedPromise, allFinishedResolve] = createPromise()

  async function waitFinishAll() {
    if (countMax > 0) {
      const [promise, resolve] = createPromise()
      events.once('didFinish', resolve)
      return promise
    }
  }

  function didFinish() {
    void events.emit('didFinish')
    // allFinishedResolve(countMax)
    countMax = 0
    countResolved = 0
  }

  function didUpdate() {
    let presentMax = 0
    let presentResolved = 0
    for (const { max, resolved, state } of Object.values(tasks)) {
      presentMax += max
      presentResolved += state === PoolTaskState.finished ? max : Math.min(max, resolved)
    }
    void events.emit(
      'didUpdate',
      countMax,
      countResolved,
      presentMax,
      presentResolved,
    )
  }

  function performNext() {
    didUpdate()
    if (countMax > 0 && countMax === countResolved)
      didFinish()
    if (currentParallel >= maxParallel)
      return
    const waitingTasks = Object.values(tasks).filter(
      t => t.state === PoolTaskState.waiting,
    )
    if (waitingTasks.length > 0) {
      let taskInfo: PoolTask<T> | undefined
      for (const t of waitingTasks) {
        // Skip task if one of same group is running.
        // Forces serialized execution for subgroup of tasks.
        if (
          t.group != null
          && Object.values(tasks).some(
            tt =>
              tt.state === PoolTaskState.running
              && tt.id !== t.id
              && tt.group === t.group,
          )
        )
          continue

        // fifo
        if (taskInfo == null || t.priority < taskInfo.priority)
          taskInfo = t
      }
      if (taskInfo != null) {
        const id = taskInfo.id
        const done = taskInfo.done
        taskInfo.state = PoolTaskState.running
        ++currentParallel
        void events.emit('didStart', id)

        const taskFinished = (result?: T) => {
          if (taskInfo) {
            taskInfo.result = result
            taskInfo.state = PoolTaskState.finished
            taskInfo.resolved = taskInfo.max
          }
          --currentParallel
          ++countResolved
          performNext()
        }

        taskInfo
          .task(taskInfo)
          .then((r) => {
            done(r)
            void events.emit('didResolve', id, r)
            taskFinished(r)
          })
          .catch((err) => {
            done()
            void events.emit('didReject', id, err)
            taskFinished()
          })
      }
    }
  }

  function cancel(id: string) {
    const taskInfo = tasks[id]
    if (taskInfo && taskInfo.state === PoolTaskState.waiting) {
      tasks[id].state = PoolTaskState.finished
      ++countResolved
      void events.emit('didCancel', id)
      didUpdate()
    }
  }

  function cancelAll() {
    Object.keys(tasks).forEach(cancel)
  }

  function enqueue<P>(
    task: PoolTaskFn<T>,
    config: {
      id?: string
      max?: number
      resolved?: number
      group?: string
      idConflictResolution?: PoolTaskIdConflictResolution
      payload?: P
    } = {},
  ) {
    let done: any
    const promise: Promise<any> = new Promise(resolve => (done = resolve))
    const id = config.id ?? uuid()

    if (tasks[id] != null) {
      const resolution = config.idConflictResolution ?? PoolTaskIdConflictResolution.memoize

      if (resolution === PoolTaskIdConflictResolution.replace) {
        cancel(id)
      }
      else if (resolution === PoolTaskIdConflictResolution.memoize) {
        // todo ???
        const runningTask = tasks[id]
        return {
          id,
          promise: (async () => {
            if (runningTask.state === PoolTaskState.finished)
              return tasks[id].result

            // todo: wait for task to finish
          })(),
          dispose: () => cancel(id),
          cancel: () => cancel(id),
        }
      }
      else {
        throw new Error(`Pool task with id=${id} already exists!`)
      }
    }

    tasks[id] = {
      id,
      task,
      priority: ++priority,
      group: config.group,
      state: PoolTaskState.waiting,
      max: config.max ?? 1,
      resolved: config.resolved ?? 0,
      done,
      payload: config.payload,
      setMax(max) {
        tasks[id].max = max
        didUpdate()
      },
      setResolved(max) {
        tasks[id].resolved = max
        didUpdate()
      },
      incResolved(inc = 1) {
        tasks[id].resolved += inc
        didUpdate()
      },
    }
    ++countMax
    performNext()

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
    // allFinishedPromise,
    waitFinishAll,
  }
}

export type Pool = ReturnType<typeof usePool>
