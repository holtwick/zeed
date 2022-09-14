import { useDispose } from "../dispose-defer"
import { Emitter } from "../msg/emitter"
import { objectMap, objectMergeDisposable } from "./object"

describe("object.spec", () => {
  it("should map it", async () => {
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
    expect(objectMap(sample, (k, v) => [k + "_" + v, k]))
      .toMatchInlineSnapshot(`
        Object {
          "a_1": "a",
          "b_2": "b",
        }
      `)
  })

  it("should merge", async () => {
    let emitter = new Emitter()
    let obj = {
      dispose: useDispose(),
      f() {
        return 42
      },
    }
    let x = 1
    obj.dispose.add(() => x++)
    let m = objectMergeDisposable(emitter, obj)
    expect(m.f()).toBe(42)
    m.on("a", () => x++)
    m.emit("a")
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
})
