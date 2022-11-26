import {csv} from './csv'

describe("csv.spec", () => {
  it("should generate csv", async () => {
    let txt = csv([
      [1, "one", 1e10, '1e10', 1.23],
      [2, "two", null, undefined, true],
      [3, "tree \"drei\"", {}, {a:1}, [1,2,3]],
    ], {
      header: [
      '1', '2','3','4','5'
    ]})
    expect(txt).toMatchInlineSnapshot(`
      "1,2,3,4,5
      1,\\"one\\",10000000000,\\"1e10\\",1.23
      2,\\"two\\",,,1
      3,\\"tree \\"\\"drei\\"\\"\\",{},{\\"a\\":1},[1,2,3]
      "
    `)
  })
})