import { setupEnv } from "./env"

describe("ENV", () => {
  it("should respect both files", () => {
    let env = {}
    setupEnv({
      // debug: true,
      filename: ".editorconfig",
      prefix: "tmp_test_lib_",
      env,
    })
    // console.dir(env)
    // @ts-ignore
    expect(env.tmp_test_lib_charset).toBe("utf-8")
  })
})
