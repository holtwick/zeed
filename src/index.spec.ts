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

        // dist/chunk-GL7MJCWF.js
        var s4 = "\\\\u0300-\\\\u036f";
        var t2 = "\\\\ufe20-\\\\ufe2f";
        var c6 = "\\\\u20d0-\\\\u20ff";
        var f3 = "\\\\u1ab0-\\\\u1aff";
        var i3 = "\\\\u1dc0-\\\\u1dff";
        var l6 = s4 + t2 + c6 + f3 + i3;
        var d4 = \`[\${l6}]\`;
        var g2 = RegExp(d4, "g");

        // <stdin>
        var a19 = [1, 2, 3, 3, 4];
        var aa = a8(a19);
        console.log("result arrayUnion", aa);
      })();
      "
    `)
  })
})
