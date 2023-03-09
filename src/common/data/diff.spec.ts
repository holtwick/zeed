import { diffObjects } from './diff'

describe('diff.spec', () => {
  it('should diff', async () => {
    const left = {
      a: 1,
      b: 2,
      d: {
        x: 11,
        y: 22,
      },
      f: undefined,
    }
    const right = {
      a: 1,
      b: undefined, // b deleted
      c: { // c added
        m: 11,
        n: 22,
        o: {
          t: 333,
        },
      },
      d: {
        // x deleted
        y: 22,
        z: 33,
      },
      e: 5, // e new
      f: null, // f ignored
    }

    // Change

    const change = diffObjects(left, right)
    expect(change).toMatchInlineSnapshot(`
      Array [
        Object {
          "path": Array [
            "b",
          ],
          "type": "upd",
          "value": undefined,
        },
        Object {
          "path": Array [
            "d",
            "x",
          ],
          "type": "del",
        },
        Object {
          "path": Array [
            "d",
            "z",
          ],
          "type": "new",
          "value": 33,
        },
        Object {
          "path": Array [
            "f",
          ],
          "type": "upd",
          "value": null,
        },
        Object {
          "path": Array [
            "c",
          ],
          "type": "new",
          "value": Object {
            "m": 11,
            "n": 22,
            "o": Object {
              "t": 333,
            },
          },
        },
        Object {
          "path": Array [
            "e",
          ],
          "type": "new",
          "value": 5,
        },
      ]
    `)
  })
})
