import { resolve } from 'node:path'
import * as esbuild from 'esbuild'

describe('treeshake', () => {
  it('should shake it', async () => {
    const code = `          
      import { arrayUnion } from './index.browser.ts'
 
      let a = [1,2,3,3,4]
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
        var a = [1, 2, 3, 3, 4];
        var aa = arrayUnion(a);
        console.log("result arrayUnion", aa);
      })();
      "
    `)
  })

  // it('should shake it in lib as well', async () => {
  //   const code = `
  //     import { arrayUnion } from '../lib/index.browser.js'

  //     let a = [1,2,3,3,4]
  //     let aa = arrayUnion(a)

  //     console.log('result arrayUnion', aa)
  //   `

  //   const opt = {
  //     stdin: {
  //       contents: code,
  //       resolveDir: resolve(__dirname),
  //     },
  //     write: false,
  //     bundle: true,
  //     treeShaking: true,
  //     minify: false,
  //   }

  //   const result1 = await esbuild.build(opt)
  //   expect(result1?.outputFiles?.[0]?.text).toMatchInlineSnapshot(`
  //     "(() => {
  //       // lib/common/data/array.js
  //       function arrayUnique(x) {
  //         return x.filter((n, index) => x.indexOf(n) === index);
  //       }
  //       function arrayUnion(...a2) {
  //         return arrayUnique(a2.reduce((acc = [], value) => acc.concat(value), []));
  //       }

  //       // <stdin>
  //       var a = [1, 2, 3, 3, 4];
  //       var aa = arrayUnion(a);
  //       console.log("result arrayUnion", aa);
  //     })();
  //     "
  //   `)
  // })

  it('should shake it in dist as well', async () => {
    const code = `          
      import { arrayUnion } from '..'
 
      let a = [1,2,3,3,4]
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
    expect(result1?.outputFiles?.[0]?.text).toMatchInlineSnapshot(`
      "(() => {
        // dist/chunk-E6K4QJKR.js
        function u2(e5) {
          return e5.filter((r9, n9) => e5.indexOf(r9) === n9);
        }
        function a8(...e5) {
          return u2(e5.reduce((r9 = [], n9) => r9.concat(n9), []));
        }

        // <stdin>
        var a19 = [1, 2, 3, 3, 4];
        var aa = a8(a19);
        console.log("result arrayUnion", aa);
      })();
      "
    `)
  })
})
