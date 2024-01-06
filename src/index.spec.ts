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
        // dist/chunk-PYEUK3HW.js
        var BIT18 = 1 << 17;
        var BIT19 = 1 << 18;
        var BIT20 = 1 << 19;
        var BIT21 = 1 << 20;
        var BIT22 = 1 << 21;
        var BIT23 = 1 << 22;
        var BIT24 = 1 << 23;
        var BIT25 = 1 << 24;
        var BIT26 = 1 << 25;
        var BIT27 = 1 << 26;
        var BIT28 = 1 << 27;
        var BIT29 = 1 << 28;
        var BIT30 = 1 << 29;
        var BIT31 = 1 << 30;
        var BIT32 = 1 << 31;
        var BITS17 = BIT18 - 1;
        var BITS18 = BIT19 - 1;
        var BITS19 = BIT20 - 1;
        var BITS20 = BIT21 - 1;
        var BITS21 = BIT22 - 1;
        var BITS22 = BIT23 - 1;
        var BITS23 = BIT24 - 1;
        var BITS24 = BIT25 - 1;
        var BITS25 = BIT26 - 1;
        var BITS26 = BIT27 - 1;
        var BITS27 = BIT28 - 1;
        var BITS28 = BIT29 - 1;
        var BITS29 = BIT30 - 1;
        var BITS30 = BIT31 - 1;

        // dist/chunk-2OESVESN.js
        function arrayUnique(x) {
          return x.filter((n, index) => x.indexOf(n) === index);
        }
        function arrayUnion(...a2) {
          return arrayUnique(a2.reduce((acc = [], value) => acc.concat(value), []));
        }

        // dist/chunk-S5FNXVUE.js
        var rsComboMarksRange = "\\\\u0300-\\\\u036f";
        var reComboHalfMarksRange = "\\\\ufe20-\\\\ufe2f";
        var rsComboSymbolsRange = "\\\\u20d0-\\\\u20ff";
        var rsComboMarksExtendedRange = "\\\\u1ab0-\\\\u1aff";
        var rsComboMarksSupplementRange = "\\\\u1dc0-\\\\u1dff";
        var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange + rsComboMarksExtendedRange + rsComboMarksSupplementRange;
        var rsCombo = \`[\${rsComboRange}]\`;
        var reComboMark = RegExp(rsCombo, "g");

        // <stdin>
        var a = [1, 2, 3, 3, 4];
        var aa = arrayUnion(a);
        console.log("result arrayUnion", aa);
      })();
      "
    `)
  })
})
