// Inspired by https://developer.apple.com/documentation/foundation/progress

import { arrayRemoveElement } from '../data/array'
import { useDispose } from '../dispose-defer'
import { Emitter } from '../msg/emitter'
import { uname } from '../uuid'

export interface ProgressOptions {
  totalUnits?: number
  completeUnits?: number
  resetWhenFinished?: boolean
  name?: string
}

/**
 * Progress helper with these properties:
 *
 * - `totalUnits` and `completedUnits` for progress
 * - Can be cancelled
 * - Sends events on cancel, changed and dispose
 * - Supports children and propagates values.
 *   Total progress is sum of all units in the tree.
 * - On `dispose` child removes itself from parent.
 */
export class Progress extends Emitter<{
  progressCancelled: (progress: Progress) => void
  progressChanged: (progress: Progress) => void
  progressDispose: (progress: Progress) => void
}> {
  private _totalUnits: number
  private _completedUnits: number
  private _isCancelled = false
  private _resetWhenFinished = true
  private _children: Progress[] = []

  dispose = useDispose()
  name: string

  constructor(opt: ProgressOptions = {}) {
    super()

    this._totalUnits = opt.totalUnits ?? 0
    this._completedUnits = opt.completeUnits ?? 0
    this._resetWhenFinished = opt.resetWhenFinished ?? true
    this.name = opt.name ?? uname('progress')

    // Make sure to cleanup also children
    this.dispose.add(async () => {
      for (const child of this._children)
        await child.dispose()
      await this.emit('progressDispose', this)
    })
  }

  /** Notify others about changes and reset on completion, if flag is set. */
  private update() {
    void this.emit('progressChanged', this)

    if (this._isCancelled && this._resetWhenFinished) {
      if (this.getTotalUnits() <= this.getCompletedUnits())
        this.reset()
    }
  }

  /** Fresh start */
  reset() {
    if (this._isCancelled) {
      this._isCancelled = false
      for (const child of this._children)
        child.reset()
      this.update()
    }
  }

  /** Notify and mark as cancelled. May take some time before having an effect. */
  async cancel() {
    if (!this._isCancelled) {
      this._isCancelled = true
      await this.emit('progressCancelled', this)
      for (const child of this._children)
        await child.cancel()
      this.update()
    }
  }

  /** Add child progress, which count into its parents units. On `dispose` it will auto remove itself from parent. */
  addChild(child: Progress) {
    child.on('progressDispose', () => this.removeChild(child))
    child.on('progressChanged', () => this.update())
    if (!this._children.includes(child))
      this._children.push(child)
    this.update()
  }

  /** Create child progress.  */
  createChildProgress(opt?: ProgressOptions) {
    const progress = new Progress(opt)
    this.addChild(progress)
    return progress
  }

  removeChild(child: Progress) {
    arrayRemoveElement(this._children, child)
    this.update()
  }

  /** Total units including children */
  getTotalUnits(): number {
    if (this.isIndeterminate())
      return 0
    let units = this._totalUnits
    for (const child of this._children)
      units += child.getTotalUnits()
    return units
  }

  /** Completed units including children */
  getCompletedUnits(): number {
    if (this.isIndeterminate())
      return 0
    let units = this._completedUnits
    for (const child of this._children)
      units += child.getCompletedUnits()
    return units
    //  return Math.min(this.getTotalUnits(), units)
  }

  /** Cannot calculate progress, because totalUnits are missing. Special representation in UI. */
  isIndeterminate(): boolean {
    return this._totalUnits <= 0 && this._children.length <= 0
  }

  isCancelled() {
    return this._isCancelled
  }

  /** Either disposed or all units completed. */
  isFinished() {
    return this.dispose.isDisposed() || (!this.isIndeterminate() && (this.getTotalUnits() <= this.getCompletedUnits()))
  }

  /** Value from 0 to 1, where 1 is 100% completeness. */
  getFraction() {
    if (this.isIndeterminate())
      return 0
    let value = this.getCompletedUnits() / this.getTotalUnits()
    if (Number.isNaN(value))
      value = 0
    return Math.min(1, Math.max(0, value))
  }

  getChildrenCount() {
    return this._children.length
  }

  /** Change total units. */
  setTotalUnits(units: number, completedUnits?: number) {
    this._totalUnits = units
    if (completedUnits != null)
      this._completedUnits = completedUnits
    this.update()
  }

  /** Relatively change total units. */
  incTotalUnits(step = 1) {
    this._totalUnits += step
    this.update()
  }

  /** Set fixed number of completed units. */
  setCompletetedUnits(units: number) {
    this._completedUnits = units
    this.update()
  }

  /** Set to 100% without disposing. */
  setCompleted() {
    this._completedUnits = this._totalUnits
    this.update()
  }

  /** Dynamically change completed units. */
  incCompletedUnits(step = 1) {
    this._completedUnits += step
    this.update()
  }

  /** Progress tree to string for debuggin purposes. Consider using `name` attribute of Progress. */
  toString(indent = 0) {
    let s = `${'  '.repeat(indent)}${this.name}: ${this._completedUnits} of ${this._totalUnits} units, ${Math.floor(this.getFraction() * 100)} %, cancel=${this._isCancelled}\n`
    for (const child of this._children)
      s += child.toString(indent + 1)
    if (indent === 0)
      return s.trim()
    return s
  }
}
