import { parseArgs } from "./args"

describe("args.spec", () => {
  it("should parse correctly", async () => {
    let result = parseArgs([
      "file",
      "--on",
      "-i",
      "-o",
      "string",
      "--some=test",
      "--some-number=123",
      '--some-one="empty string"',
    ])
    expect(result).toMatchInlineSnapshot(`
      {
        "--on": true,
        "--some": "test",
        "--some-number": "123",
        "--some-one": "\\"empty string\\"",
        "-i": true,
        "-o": "string",
        "file": true,
      }
    `)
  })
})
