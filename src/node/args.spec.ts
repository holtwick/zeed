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
        "--some-number=123",
        '--some-one="empty string"',
      ],
      boolean: ["help", "on", "i"],
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
        "someNumber": "123",
        "someOne": "\\"empty string\\"",
      }
    `)
  })
})
