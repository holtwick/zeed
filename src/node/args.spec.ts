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
      '--some-one="empty string"',
    ])
    expect(result).toMatchInlineSnapshot(`
      {
        "--on": true,
        "--some-one=\\"empty string\\"": true,
        "--some=test": true,
        "-i": true,
        "-o": "string",
        "file": true,
      }
    `)
  })
})
