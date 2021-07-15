// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { composeOrderby, parseOrderby, sortedOrderby } from "./orderby"

describe("Order by", () => {
  it("should order correctly", () => {
    expect(parseOrderby("timestamp asc")).toMatchInlineSnapshot(`
      Object {
        "asc": true,
        "desc": false,
        "field": "timestamp",
        "orderby": "asc",
      }
    `)
    expect(parseOrderby("timestamp desc")).toMatchInlineSnapshot(`
      Object {
        "asc": false,
        "desc": true,
        "field": "timestamp",
        "orderby": "desc",
      }
    `)
    expect(parseOrderby("timestamp xxx")).toMatchInlineSnapshot(`
      Object {
        "asc": true,
        "desc": false,
        "field": "timestamp",
        "orderby": "xxx",
      }
    `)
    expect(parseOrderby("timestamp")).toMatchInlineSnapshot(`
      Object {
        "asc": true,
        "desc": false,
        "field": "timestamp",
        "orderby": "asc",
      }
    `)
  })

  it("should compose", () => {
    expect(composeOrderby("timestamp")).toMatchInlineSnapshot(`"timestamp asc"`)
    expect(composeOrderby("timestamp", true)).toMatchInlineSnapshot(
      `"timestamp asc"`
    )
    expect(composeOrderby("timestamp", false)).toMatchInlineSnapshot(
      `"timestamp desc"`
    )
  })

  it("should sort by", () => {
    const values = [
      {
        name: "b",
      },
      {
        name: "a",
      },
      {
        name: "c",
      },
    ]
    expect(sortedOrderby(values, "name desc")).toMatchInlineSnapshot(`
      Array [
        Object {
          "name": "c",
        },
        Object {
          "name": "b",
        },
        Object {
          "name": "a",
        },
      ]
    `)
    expect(sortedOrderby(values, "name asc")).toMatchInlineSnapshot(`
      Array [
        Object {
          "name": "a",
        },
        Object {
          "name": "b",
        },
        Object {
          "name": "c",
        },
      ]
    `)
  })
})
