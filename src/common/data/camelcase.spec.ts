// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import {
  fromCamelCase,
  toCamelCase,
  toCapitalize,
  toCapitalizeWords,
} from "./camelcase"

describe("camelcase", () => {
  it("should convert", () => {
    expect(
      [
        "  spaces  somewhere  ",
        "BigOnesAtStart",
        "camel_case_classic_123",
        "-camel-case-classic",
        "ONLY_CAPTITAL_LETTERS_123",
      ].map(toCamelCase)
    ).toMatchInlineSnapshot(`
Array [
  "spacesSomewhere",
  "bigOnesAtStart",
  "camelCaseClassic123",
  "camelCaseClassic",
  "onlyCaptitalLetters123",
]
`)
  })

  it("should capitalize", () => {
    expect(
      [
        "this is a test",
        "Capital first",
        "ALL BIG",
        "5tart with number and endin6",
      ].map(toCapitalize)
    ).toMatchInlineSnapshot(`
Array [
  "This is a test",
  "Capital first",
  "All big",
  "5tart with number and endin6",
]
`)
  })

  it("should capitalize words", () => {
    expect(
      [
        "this is a test",
        "Capital first",
        "ALL BIG",
        "5tart with number and endin6",
      ].map(toCapitalizeWords)
    ).toMatchInlineSnapshot(`
Array [
  "This Is A Test",
  "Capital First",
  "All Big",
  "5tart With Number And Endin6",
]
`)
  })

  it("should convert back", () => {
    expect(
      [
        "spacesSomewhere",
        "bigOnesAtStart",
        "camelCaseClassic123",
        "camelCaseClassic",
        "onlyCaptitalLetters123",
      ].map((s) => fromCamelCase(s))
    ).toMatchInlineSnapshot(`
Array [
  "spaces-somewhere",
  "big-ones-at-start",
  "camel-case-classic123",
  "camel-case-classic",
  "only-captital-letters123",
]
`)
  })
})
