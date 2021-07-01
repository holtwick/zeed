import { toCamelCase } from "./camelcase"

describe("camelcasex", () => {
  it("should convert", () => {
    expect(
      [
        "  spaces  somewhere  ",
        "BigOnesAtStart",
        "camel_case_classic_123",
        "-camel-case-classic",
        "ONLY_CAPTITAL_LETTERS_123",
      ].map(toCamelCase)
    ).toEqual([
      "spacesSomewhere",
      "bigOnesAtStart",
      "camelCaseClassic123",
      "camelCaseClassic",
      "onlyCaptitalLetters123",
    ])
  })
})
