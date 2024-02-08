import { useDispose } from '../dispose-defer'
import { Emitter } from '../msg/emitter'
import { objectInclusivePick, objectMap, objectMergeDisposable, objectOmit, objectPick } from './object'

describe('object.spec', () => {
  it('should map it', async () => {
    const sample = {
      a: 1,
      b: 2,
    }
    expect(objectMap<number>(sample, (k, v) => v + 10)).toMatchInlineSnapshot(`
      Object {
        "a": 11,
        "b": 12,
      }
    `)
    expect(objectMap(sample, (k, v) => [`${k}_${v}`, k]))
      .toMatchInlineSnapshot(`
        Object {
          "a_1": "a",
          "b_2": "b",
        }
      `)
  })

  it('should merge', async () => {
    const emitter = new Emitter()
    const obj = {
      dispose: useDispose(),
      f() {
        return 42
      },
    }
    let x = 1
    obj.dispose.add(() => x++)
    const m = objectMergeDisposable(emitter, obj)
    expect(m.f()).toBe(42)
    m.on('a', () => x++)
    void m.emit('a')
    expect(x).toBe(2)
    await m.dispose()
    expect(x).toBe(3)
  })

  // it("should merge vice versa", async () => {
  //   let emitter = new Emitter()
  //   let obj = {
  //     dispose: useDispose(),
  //     f() {
  //       return 42
  //     },
  //   }
  //   let x = 1
  //   obj.dispose.add(() => x++)
  //   let m = objectMergeDisposable(obj, emitter)
  //   expect(m.f()).toBe(42)
  //   m.on("a", () => x++)
  //   m.emit("a")
  //   expect(x).toBe(2)
  //   await m.dispose()
  //   expect(x).toBe(3)
  // })

  it('should omit and pick', () => {
    const o = { a: 1, b: 2, c: 3, d: 4 }
    expect(objectPick(o, 'a', 'c')).toMatchInlineSnapshot(`
      Object {
        "a": 1,
        "c": 3,
      }
    `)
    expect(objectOmit(o, 'a', 'c')).toMatchInlineSnapshot(`
      Object {
        "b": 2,
        "d": 4,
      }
    `)
    expect(objectInclusivePick(o, 'a', 'c', 'x')).toMatchInlineSnapshot(`
      Object {
        "a": 1,
        "c": 3,
        "x": undefined,
      }
    `)
  })
})
