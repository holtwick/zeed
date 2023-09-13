import { deburr } from "./string-deburr"

describe("string-deburr.spec", () => {
  it("should deburr", async () => {
    expect(deburr('👨‍👩‍👦 déjà vu')).toMatchInlineSnapshot('"👨‍👩‍👦 deja vu"')
  })
})