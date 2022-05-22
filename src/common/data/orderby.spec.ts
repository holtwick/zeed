// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { composeOrderby, parseOrderby, sortedOrderby } from "./orderby"

describe("Order by", () => {
  it("should order correctly", () => {
    expect(parseOrderby("timestamp asc")).toEqual({
      asc: true,
      desc: false,
      field: "timestamp",
      orderby: "asc",
    })
    expect(parseOrderby("timestamp desc")).toEqual({
      asc: false,
      desc: true,
      field: "timestamp",
      orderby: "desc",
    })
    expect(parseOrderby("timestamp xxx")).toEqual({
      asc: true,
      desc: false,
      field: "timestamp",
      orderby: "xxx",
    })
    expect(parseOrderby("timestamp")).toEqual({
      asc: true,
      desc: false,
      field: "timestamp",
      orderby: "asc",
    })
  })

  it("should compose", () => {
    expect(composeOrderby("timestamp")).toEqual("timestamp asc")
    expect(composeOrderby("timestamp", true)).toEqual("timestamp asc")
    expect(composeOrderby("timestamp", false)).toEqual("timestamp desc")
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
    expect(sortedOrderby(values, "name desc")).toEqual([
      {
        name: "c",
      },
      {
        name: "b",
      },
      {
        name: "a",
      },
    ])
    expect(sortedOrderby(values, "name asc")).toEqual([
      {
        name: "a",
      },
      {
        name: "b",
      },
      {
        name: "c",
      },
    ])
  })

  it("should sort by2", () => {
    const values = [
      {
        group: 1,
        name: "b",
      },
      {
        group: 1,
        name: "a",
      },
      {
        group: 2,
        name: "c",
      },
      {
        group: 1,
        name: "d",
      },
    ]
    expect(sortedOrderby(values, "group desc", "name asc")).toEqual([
      {
        group: 2,
        name: "c",
      },
      {
        group: 1,
        name: "a",
      },
      {
        group: 1,
        name: "b",
      },
      {
        group: 1,
        name: "d",
      },
    ])

    expect(sortedOrderby(values, "group", "name desc")).toEqual([
      {
        group: 1,
        name: "d",
      },
      {
        group: 1,
        name: "b",
      },
      {
        group: 1,
        name: "a",
      },
      {
        group: 2,
        name: "c",
      },
    ])
  })
})
