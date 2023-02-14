import { Emitter } from '../msg/emitter'
import { uname, uuid } from '../uuid'
import { Progress } from './progress'
import { createPromise } from './promise'

interface PoolConfig {
  name?: string
  maxParallel?: number
}

export type PoolTaskFn<T = any> = (taskInfo: PoolTask<T>) => Promise<T>

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

  progress: Progress
  max: number
  resolved: number

  result?: T
  payload?: unknown
}

export enum PoolTaskIdConflictResolution {
  /**
   * Tasks with same `id` are replaced. Newest wins.
   */
  replace,

  /**
   * Task with same `id` will continue to run. Reference is returned with option to cancel.
   * Named "memoize" because the result of the task should always be the same for the same `id`,
   * like e.g. a download.
   */
  memoize,

  /**
   * Tasks with same `id` throw error
   */
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
  const { maxParallel = 3, name = uname('pool') } = config
  const events = new Emitter<PoolTaskEvents>()

  const progress = new Progress({ name })

  progress.on('progressCancelled', cancelAll)

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

  async function cleanupFinished() {
    for (const id of Object.keys(tasks)) {
      const task = tasks[id]
      if (task.state === PoolTaskState.finished) {
        await tasks[id].progress.dispose()
        delete tasks[id]
      }
    }
  }

  function didFinish() {
    void events.emit('didFinish')
    // allFinishedResolve(countMax)
    countMax = 0
    countResolved = 0
    void cleanupFinished()
    progress.reset()
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
            // void taskInfo.progress.dispose()
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
      void tasks[id].progress.dispose()
      didUpdate()
    }
  }

  function cancelAll() {
    Object.keys(tasks).forEach(cancel)
    // progress.dispose()
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

    const taskProgress = new Progress({
      name: id,
      totalUnits: config.max ?? 1,
      completeUnits: config.resolved ?? 0,
    })

    progress.addChild(taskProgress)

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
      progress: taskProgress,

      /** @deprecated should use `.progress` */
      setMax(units) {
        taskProgress.setTotalUnits(units)
        tasks[id].max = units
        didUpdate()
      },

      /** @deprecated should use `.progress` */
      setResolved(units) {
        taskProgress.setCompletetedUnits(units)
        tasks[id].resolved = units
        didUpdate()
      },

      /** @deprecated should use `.progress` */
      incResolved(inc = 1) {
        taskProgress.incCompletedUnits(inc)
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
    progress,
    enqueue,
    dispose: cancelAll,
    // allFinishedPromise,
    waitFinishAll,
  }
}

export type Pool = ReturnType<typeof usePool>
