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
        // dist/chunk-CEZXZXMN.js
        var fromCharCode = String.fromCharCode;
        var fromCodePoint = String.fromCodePoint;

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

        // dist/chunk-GV2YUBK6.js
        function basePropertyOf(object) {
          return (key) => object == null ? void 0 : object[key];
        }
        var deburredLetters = {
          // Latin-1 Supplement block.
          \\u00C0: "A",
          \\u00C1: "A",
          \\u00C2: "A",
          \\u00C3: "A",
          \\u00C4: "A",
          \\u00C5: "A",
          \\u00E0: "a",
          \\u00E1: "a",
          \\u00E2: "a",
          \\u00E3: "a",
          \\u00E4: "a",
          \\u00E5: "a",
          \\u00C7: "C",
          \\u00E7: "c",
          \\u00D0: "D",
          \\u00F0: "d",
          \\u00C8: "E",
          \\u00C9: "E",
          \\u00CA: "E",
          \\u00CB: "E",
          \\u00E8: "e",
          \\u00E9: "e",
          \\u00EA: "e",
          \\u00EB: "e",
          \\u00CC: "I",
          \\u00CD: "I",
          \\u00CE: "I",
          \\u00CF: "I",
          \\u00EC: "i",
          \\u00ED: "i",
          \\u00EE: "i",
          \\u00EF: "i",
          \\u00D1: "N",
          \\u00F1: "n",
          \\u00D2: "O",
          \\u00D3: "O",
          \\u00D4: "O",
          \\u00D5: "O",
          \\u00D6: "O",
          \\u00D8: "O",
          \\u00F2: "o",
          \\u00F3: "o",
          \\u00F4: "o",
          \\u00F5: "o",
          \\u00F6: "o",
          \\u00F8: "o",
          \\u00D9: "U",
          \\u00DA: "U",
          \\u00DB: "U",
          \\u00DC: "U",
          \\u00F9: "u",
          \\u00FA: "u",
          \\u00FB: "u",
          \\u00FC: "u",
          \\u00DD: "Y",
          \\u00FD: "y",
          \\u00FF: "y",
          \\u00C6: "Ae",
          \\u00E6: "ae",
          \\u00DE: "Th",
          \\u00FE: "th",
          \\u00DF: "ss",
          // Latin Extended-A block.
          \\u0100: "A",
          \\u0102: "A",
          \\u0104: "A",
          \\u0101: "a",
          \\u0103: "a",
          \\u0105: "a",
          \\u0106: "C",
          \\u0108: "C",
          \\u010A: "C",
          \\u010C: "C",
          \\u0107: "c",
          \\u0109: "c",
          \\u010B: "c",
          \\u010D: "c",
          \\u010E: "D",
          \\u0110: "D",
          \\u010F: "d",
          \\u0111: "d",
          \\u0112: "E",
          \\u0114: "E",
          \\u0116: "E",
          \\u0118: "E",
          \\u011A: "E",
          \\u0113: "e",
          \\u0115: "e",
          \\u0117: "e",
          \\u0119: "e",
          \\u011B: "e",
          \\u011C: "G",
          \\u011E: "G",
          \\u0120: "G",
          \\u0122: "G",
          \\u011D: "g",
          \\u011F: "g",
          \\u0121: "g",
          \\u0123: "g",
          \\u0124: "H",
          \\u0126: "H",
          \\u0125: "h",
          \\u0127: "h",
          \\u0128: "I",
          \\u012A: "I",
          \\u012C: "I",
          \\u012E: "I",
          \\u0130: "I",
          \\u0129: "i",
          \\u012B: "i",
          \\u012D: "i",
          \\u012F: "i",
          \\u0131: "i",
          \\u0134: "J",
          \\u0135: "j",
          \\u0136: "K",
          \\u0137: "k",
          \\u0138: "k",
          \\u0139: "L",
          \\u013B: "L",
          \\u013D: "L",
          \\u013F: "L",
          \\u0141: "L",
          \\u013A: "l",
          \\u013C: "l",
          \\u013E: "l",
          \\u0140: "l",
          \\u0142: "l",
          \\u0143: "N",
          \\u0145: "N",
          \\u0147: "N",
          \\u014A: "N",
          \\u0144: "n",
          \\u0146: "n",
          \\u0148: "n",
          \\u014B: "n",
          \\u014C: "O",
          \\u014E: "O",
          \\u0150: "O",
          \\u014D: "o",
          \\u014F: "o",
          \\u0151: "o",
          \\u0154: "R",
          \\u0156: "R",
          \\u0158: "R",
          \\u0155: "r",
          \\u0157: "r",
          \\u0159: "r",
          \\u015A: "S",
          \\u015C: "S",
          \\u015E: "S",
          \\u0160: "S",
          \\u015B: "s",
          \\u015D: "s",
          \\u015F: "s",
          \\u0161: "s",
          \\u0162: "T",
          \\u0164: "T",
          \\u0166: "T",
          \\u0163: "t",
          \\u0165: "t",
          \\u0167: "t",
          \\u0168: "U",
          \\u016A: "U",
          \\u016C: "U",
          \\u016E: "U",
          \\u0170: "U",
          \\u0172: "U",
          \\u0169: "u",
          \\u016B: "u",
          \\u016D: "u",
          \\u016F: "u",
          \\u0171: "u",
          \\u0173: "u",
          \\u0174: "W",
          \\u0175: "w",
          \\u0176: "Y",
          \\u0177: "y",
          \\u0178: "Y",
          \\u0179: "Z",
          \\u017B: "Z",
          \\u017D: "Z",
          \\u017A: "z",
          \\u017C: "z",
          \\u017E: "z",
          \\u0132: "IJ",
          \\u0133: "ij",
          \\u0152: "Oe",
          \\u0153: "oe",
          \\u0149: "'n",
          \\u017F: "s"
        };
        var deburrLetter = basePropertyOf(deburredLetters);
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
