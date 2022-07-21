import { parseArgs } from "./args"

describe("args.spec", () => {
  it("should parse correctly", async () => {
    let result = parseArgs({
      args: [
        "file",
        "--on",
        "-?",
        "-i",
        "-o",
        "string",
        "free",
        "--some=test",
        "--some=test2",
        "--some-more=test3",
        "--some-list=listItem",
        "--some-number=123",
        '--some-one="empty string"',
      ],
      booleanArgs: ["help", "on", "i"],
      listArgs: ["someList"],
      numberArgs: ["someNumber"],
      alias: {
        some: ["some-more"],
        help: ["h", "?"],
      },
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "_": [
          "file",
          "free",
        ],
        "help": true,
        "i": true,
        "o": "string",
        "on": true,
        "some": [
          "test",
          "test2",
          "test3",
        ],
        "someList": [
          "listItem",
        ],
        "someNumber": 123,
        "someOne": "\\"empty string\\"",
      }
    `)
  })
})
