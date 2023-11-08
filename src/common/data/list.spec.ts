import { listDistinctUnion, listGroupBy, listOfKey, listQuery } from './list'

const sampleList = [
  { id: 1, title: 'aaa', age: 22 },
  { id: 2, title: 'bbb', age: 22 },
  { id: 3, title: 'agga', age: 33 },
]

describe('list', () => {
  it('should query', () => {
    expect(listOfKey(sampleList, 'age')).toMatchInlineSnapshot(`
      Array [
        22,
        22,
        33,
      ]
    `)

    expect(listDistinctUnion(sampleList, 'age')).toMatchInlineSnapshot(`
      Array [
        22,
        33,
      ]
    `)

    expect(listGroupBy(sampleList, 'age')).toMatchInlineSnapshot(`
      Object {
        "22": Array [
          Object {
            "age": 22,
            "id": 1,
            "title": "aaa",
          },
          Object {
            "age": 22,
            "id": 2,
            "title": "bbb",
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

    expect(
      listQuery(
        sampleList,
        [e => e.title.startsWith('a'), e => e.id <= 2],
        [e => (e.age += 1)],
      ),
    ).toMatchInlineSnapshot(`
      Array [
        23,
      ]
    `)
  })
})
