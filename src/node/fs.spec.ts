import { toHumanReadableFilePath } from "./fs"

describe("fs.spec", () => {
  it("should respect home", async () => {
    // expect(process.cwd()).toMatchInlineSnapshot('"/Users/dirk/work/public/zeed"')
    // expect(toHumanReadableFilePath(process.cwd())).toMatchInlineSnapshot(
    //   '"~/work/public/zeed"'
    // )
    expect(toHumanReadableFilePath(process.cwd()).startsWith("~")).toBe(true)
  })
})
