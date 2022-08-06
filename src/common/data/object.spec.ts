import { objectMap } from "./object"

describe("object.spec", () => {
  it("should map it", async () => {
    const sample = {
      a: 1,
      b: 2,
    }
    expect(objectMap(sample, (k, v) => v + 10)).toMatchInlineSnapshot(`
      {
        "a": 11,
        "b": 12,
      }
    `)
    expect(objectMap(sample, (k, v) => [k + "_" + v, k]))
      .toMatchInlineSnapshot(`
        {
          "a_1": "a",
          "b_2": "b",
        }
      `)
  })
})
