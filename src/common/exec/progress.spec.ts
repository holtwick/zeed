import { Progress } from './progress'

describe('progress.spec', () => {
  it('should track progress', async () => {
    // Simple progress
    const p = new Progress({
      name: 'root',
      totalUnits: 10,
    })
    expect(p.getFraction()).toBe(0)
    p.incCompletedUnits()
    expect(p.getTotalUnits()).toBe(10)
    expect(p.getCompletedUnits()).toBe(1)
    expect(p.getFraction()).toBe(0.1)

    // Child progress
    const pp = new Progress()
    // expect(pp.isFinished()).toBe(true)

    p.addChild(pp)
    expect(p.getChildrenCount()).toBe(1)
    expect(p.getFraction()).toBe(0.1)

    pp.setTotalUnits(10)
    expect(p.getFraction()).toBe(0.05)

    pp.incCompletedUnits(5)
    expect(p.getTotalUnits()).toBe(20)
    expect(p.getCompletedUnits()).toBe(6)
    expect(p.getFraction()).toBe(0.3)

    expect(p.toString()).toMatchInlineSnapshot(`
      "root: 1 of 10 units, 30 %, cancel=false
        progress-0: 5 of 10 units, 50 %, cancel=false"
    `)

    // Finished due to dispose
    expect(pp.isFinished()).toBe(false)
    expect(p.getChildrenCount()).toBe(1)
    await pp.dispose()
    expect(p.getChildrenCount()).toBe(0)
    expect(pp.isFinished()).toBe(true)

    // Child auto removed
    expect(p.getTotalUnits()).toBe(10)
    expect(p.getCompletedUnits()).toBe(1)
    expect(p.getFraction()).toBe(0.1)

    // Finish due to all units completed
    expect(p.isFinished()).toBe(false)
    p.setCompletetedUnits(10)
    expect(p.getFraction()).toBe(1)
    expect(p.isFinished()).toBe(true)
  })

  it('should cancel and auto reset', async () => {
    const p = new Progress({
      totalUnits: 10,
    })
    expect(p.isCancelled()).toBe(false)
    await p.cancel()
    expect(p.isCancelled()).toBe(true)
    p.incCompletedUnits(10)
    expect(p.isFinished()).toBe(true)
    expect(p.isCancelled()).toBe(false)
  })
})
