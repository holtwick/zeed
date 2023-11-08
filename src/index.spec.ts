import { resolve } from 'node:path'
import * as esbuild from 'esbuild'

describe('treeshake', () => {
  it('should shake it', async () => {
    const code = `    
      import { arrayUnion } from './index.browser.ts'
 
      let a = [1,2,3,3]
      let aa = arrayUnion(a)

      console.log('result arrayUnion', aa)
    `

    const opt = {
      stdin: {
        contents: code,
        resolveDir: resolve(__dirname),
      },
      write: false,
      bundle: true,
      treeShaking: true,
      minify: false,
    }

    const result1 = await esbuild.build(opt)
    //  let result2 = await esbuild.build(options)
    expect(result1?.outputFiles?.[0]?.text).toMatchInlineSnapshot(`
      "(() => {
        // src/common/data/array.ts
        function arrayUnique(x) {
          return x.filter((n, index) => x.indexOf(n) === index);
        }
        function arrayUnion(...a2) {
          return arrayUnique(a2.reduce((acc = [], value) => acc.concat(value), []));
        }

        // <stdin>
        var a = [1, 2, 3, 3];
        var aa = arrayUnion(a);
        console.log(\\"result arrayUnion\\", aa);
      })();
      "
    `)
  })
})
