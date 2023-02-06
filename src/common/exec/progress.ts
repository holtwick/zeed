// Inspired by https://developer.apple.com/documentation/foundation/progress#

import { arrayRemoveElement } from '../data'
import { Emitter } from '../msg'

export class Progress extends Emitter<{
  progressCancelled(progress: Progress): void
  progressChanged(progress: Progress): void
  progressDispose(progress: Progress): void
}> {
  private _totalUnits: number
  private _completedUnits: number
  private _isCancelled = false
  private _isCancelable: boolean
  private _children: Progress[] = []

  constructor(opt: {
    totalUnits?: number
    completeUnits?: number
    isIndeterminate?: boolean
    isCancelable?: boolean
  } = {}) {
    super()

    this._totalUnits = opt.totalUnits ?? 0
    this._completedUnits = opt.completeUnits ?? 0
    this._isCancelable = opt.isCancelable ?? true

    this.dispose.add(async () => {
      // log('dispose', this._children)
      for (const child of this._children)
        await child.dispose()
      await this.emit('progressDispose', this)
    })
  }

  private update() {
    void this.emit('progressChanged', this)
    // log('update', this._children)
  }

  /** Notify and mark as cancelled. May take some time before having an effect. */
  async cancel() {
    if (this._isCancelable && !this.isCancelled) {
      this._isCancelled = true
      await this.emit('progressCancelled', this)
      for (const child of this._children)
        await child.cancel()
    }
  }

  addChild(child: Progress) {
    child.on('progressDispose', () => {
      arrayRemoveElement(this._children, child)
    })
    child.on('progressChanged', () => {
      this.update()
    })
    if (!this._children.includes(child))
      this._children.push(child)
    this.update()
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
    return this._totalUnits <= 0
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
    return Math.min(1, Math.max(0, this.getCompletedUnits() / this.getTotalUnits()))
  }

  getChildrenCount() {
    return this._children.length
  }

  setTotalUnit(unit: number) {
    this._totalUnits = unit
    this.update()
  }

  setCompletetedUnit(unit: number) {
    this._completedUnits = unit
    this.update()
  }

  incCompletedUnit(step = 1) {
    this._completedUnits += step
    this.update()
  }
}
