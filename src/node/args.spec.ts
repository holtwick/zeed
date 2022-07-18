import { parseArgs } from "./args"

describe("args.spec", () => {
  it("should parse correctly", async () => {
    let result = parseArgs(
      [
        "file",
        "--on",
        "-i",
        "-o",
        "string",
        "--some=test",
        "--some=test2",
        "--some-more=test3",
        "--some-number=123",
        '--some-one="empty string"',
      ],
      {
        some: ["some-more"],
      }
    )
    expect(result).toMatchInlineSnapshot(`
      {
        "file": true,
        "i": true,
        "o": "string",
        "on": true,
        "some": [
          "test",
          "test2",
          "test3",
        ],
        "someNumber": "123",
        "someOne": "\\"empty string\\"",
      }
    `)
  })
})
