import { listDistinctUnion, listGroupBy, listQuery } from "./list"

const sampleList = [
  { id: 1, title: "aaa", age: 22 },
  { id: 2, title: "bbb", age: 22 },
  { id: 3, title: "agga", age: 33 },
]

describe("list", () => {
  it("should query", () => {
    expect(
      listQuery(
        sampleList,
        [(e) => e.title.startsWith("a"), (e) => e.id <= 2],
        [(e) => ((e.age += 1), e)]
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "age": 23,
          "id": 1,
          "title": "aaa",
        },
      ]
    `)
    expect(listGroupBy(sampleList, "age")).toMatchInlineSnapshot(`
      Object {
        "22": Array [
          Object {
            "age": 22,
            "id": 2,
            "title": "bbb",
          },
        ],
        "23": Array [
          Object {
            "age": 23,
            "id": 1,
            "title": "aaa",
          },
        ],
        "33": Array [
          Object {
            "age": 33,
            "id": 3,
            "title": "agga",
          },
        ],
      }
    `)
    expect(listDistinctUnion(sampleList, "age")).toMatchInlineSnapshot(`
      Array [
        23,
        22,
        33,
      ]
    `)
  })
})
