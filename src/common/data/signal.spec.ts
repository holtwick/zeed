import { useSignal } from './signal'

describe('signal', () => {
  it('should signal', async () => {
    let copy: any // copy of "flag"
    let count = 1 // counter for "name"

    const [flag, setFlag] = useSignal(true, v => copy = v)
    const name = useSignal('Henry')
    const object = useSignal({
      a: 1,
      b: 2,
    })

    const off = name.on(v => ++count)

    // Get values
    expect(flag()).toEqual(true)
    expect(name.get()).toEqual('Henry')
    expect(copy).toEqual(undefined)
    expect(object.get()).toEqual({
      a: 1,
      b: 2,
    })

    // Change values
    setFlag(false)
    name.set('Anna')
    object.set({
      a: 11,
      b: 22,
    })

    // Check changed values
    expect(flag()).toEqual(false)
    expect(name.get()).toEqual('Anna')
    expect(copy).toEqual(false)
    expect(object.get()).toEqual({
      a: 11,
      b: 22,
    })

    // Skip setting same value
    expect(count).toBe(2)
    name.set('Anna')
    expect(count).toBe(2)
    name.set('Cloe')
    expect(count).toBe(3)
    off()
    name.set('Diego')
    expect(count).toBe(3)
  })
})
