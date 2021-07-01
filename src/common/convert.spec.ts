import {
  renderMessages,
  stringify,
  valueToInteger,
  valueToString,
} from "./convert"

describe("convert", () => {
  it("should convert", () => {
    expect(valueToString(123)).toBe("123")

    expect(valueToInteger("123")).toBe(123)
    expect(valueToInteger(true)).toBe(1)
  })

  it("should stringify", () => {
    var circularObj = {}
    // @ts-ignore
    circularObj.circularRef = circularObj
    // @ts-ignore
    circularObj.list = [circularObj, circularObj]
    expect(stringify(circularObj)).toBe(
      '{"circularRef":"[Circular ~]","list":["[Circular ~]","[Circular ~]"]}'
    )
  })

  it("should print errors", () => {
    expect(renderMessages(["Message", new Error("Hello")])).toContain(
      "Message Error: Hello"
    )
    expect(
      renderMessages(["Message", new Error("Hello")], { trace: false })
    ).toBe("Message Error: Hello")
    expect(
      renderMessages([
        "Message",
        { a: 1, b: null },
        null,
        undefined,
        NaN,
        1e2,
        "string",
      ])
    ).toEqual(`Message {
  \"a\": 1,
  \"b\": null
} null undefined NaN 100 string`)
  })
})
