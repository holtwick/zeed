import { build, BuildOptions } from "esbuild"
import { resolve } from "path"

async function compileTS(path: string): Promise<any> {
  const buildConfig: BuildOptions = {
    bundle: true,
    platform: "node",
    target: "node16",
    entryPoints: [path],
    legalComments: "none",
    sourcemap: false,
    minify: false,
    treeShaking: true,
    write: false,
  }
  let result = await build(buildConfig)

  if (result.errors.length || result.warnings.length) {
    console.error("Errors", result)
    return
  }

  // @ts-ignore
  for (let out of result.outputFiles) {
    console.info("output", out.path)
    return new TextDecoder("utf-8").decode(out.contents)
  }
}

describe("sideeffects.spec", () => {
  it("should check sideeffects", async () => {
    const p = resolve(__dirname, "sideeffects.ts")
    let result = await compileTS(p)
    // console.log("result =", result)
    expect(result).toMatchInlineSnapshot(`
      "\\"use strict\\";

      // src/common/global.ts
      function _global() {
        if (typeof self !== \\"undefined\\")
          return self;
        if (typeof window !== \\"undefined\\")
          return window;
        if (typeof global !== \\"undefined\\")
          return global;
        if (typeof globalThis !== \\"undefined\\")
          return globalThis;
        throw new Error(\\"unable to locate global object\\");
      }
      function getGlobalContext() {
        let gcontext = _global();
        if (gcontext._zeedGlobal == null) {
          gcontext._zeedGlobal = {};
        }
        return gcontext._zeedGlobal;
      }

      // src/sideeffects.ts
      console.log(\\"test\\", getGlobalContext());
      "
    `)
  })
})
