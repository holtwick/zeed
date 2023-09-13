// Via lodash, MIT, https://github.com/lodash/lodash/blob/4.17.15/lodash.js#L14181

/**
 * The base implementation of `propertyOf` without support for deep paths.
 */
function basePropertyOf(object: any): any {
  return (key: any) => object == null ? undefined : object[key]
}

/** Used to map Latin Unicode letters to basic Latin letters. */
const deburredLetters = {
  // Latin-1 Supplement block.
  À: 'A',
  Á: 'A',
  Â: 'A',
  Ã: 'A',
  Ä: 'A',
  Å: 'A',
  à: 'a',
  á: 'a',
  â: 'a',
  ã: 'a',
  ä: 'a',
  å: 'a',
  Ç: 'C',
  ç: 'c',
  Ð: 'D',
  ð: 'd',
  È: 'E',
  É: 'E',
  Ê: 'E',
  Ë: 'E',
  è: 'e',
  é: 'e',
  ê: 'e',
  ë: 'e',
  Ì: 'I',
  Í: 'I',
  Î: 'I',
  Ï: 'I',
  ì: 'i',
  í: 'i',
  î: 'i',
  ï: 'i',
  Ñ: 'N',
  ñ: 'n',
  Ò: 'O',
  Ó: 'O',
  Ô: 'O',
  Õ: 'O',
  Ö: 'O',
  Ø: 'O',
  ò: 'o',
  ó: 'o',
  ô: 'o',
  õ: 'o',
  ö: 'o',
  ø: 'o',
  Ù: 'U',
  Ú: 'U',
  Û: 'U',
  Ü: 'U',
  ù: 'u',
  ú: 'u',
  û: 'u',
  ü: 'u',
  Ý: 'Y',
  ý: 'y',
  ÿ: 'y',
  Æ: 'Ae',
  æ: 'ae',
  Þ: 'Th',
  þ: 'th',
  ß: 'ss',
  // Latin Extended-A block.
  Ā: 'A',
  Ă: 'A',
  Ą: 'A',
  ā: 'a',
  ă: 'a',
  ą: 'a',
  Ć: 'C',
  Ĉ: 'C',
  Ċ: 'C',
  Č: 'C',
  ć: 'c',
  ĉ: 'c',
  ċ: 'c',
  č: 'c',
  Ď: 'D',
  Đ: 'D',
  ď: 'd',
  đ: 'd',
  Ē: 'E',
  Ĕ: 'E',
  Ė: 'E',
  Ę: 'E',
  Ě: 'E',
  ē: 'e',
  ĕ: 'e',
  ė: 'e',
  ę: 'e',
  ě: 'e',
  Ĝ: 'G',
  Ğ: 'G',
  Ġ: 'G',
  Ģ: 'G',
  ĝ: 'g',
  ğ: 'g',
  ġ: 'g',
  ģ: 'g',
  Ĥ: 'H',
  Ħ: 'H',
  ĥ: 'h',
  ħ: 'h',
  Ĩ: 'I',
  Ī: 'I',
  Ĭ: 'I',
  Į: 'I',
  İ: 'I',
  ĩ: 'i',
  ī: 'i',
  ĭ: 'i',
  į: 'i',
  ı: 'i',
  Ĵ: 'J',
  ĵ: 'j',
  Ķ: 'K',
  ķ: 'k',
  ĸ: 'k',
  Ĺ: 'L',
  Ļ: 'L',
  Ľ: 'L',
  Ŀ: 'L',
  Ł: 'L',
  ĺ: 'l',
  ļ: 'l',
  ľ: 'l',
  ŀ: 'l',
  ł: 'l',
  Ń: 'N',
  Ņ: 'N',
  Ň: 'N',
  Ŋ: 'N',
  ń: 'n',
  ņ: 'n',
  ň: 'n',
  ŋ: 'n',
  Ō: 'O',
  Ŏ: 'O',
  Ő: 'O',
  ō: 'o',
  ŏ: 'o',
  ő: 'o',
  Ŕ: 'R',
  Ŗ: 'R',
  Ř: 'R',
  ŕ: 'r',
  ŗ: 'r',
  ř: 'r',
  Ś: 'S',
  Ŝ: 'S',
  Ş: 'S',
  Š: 'S',
  ś: 's',
  ŝ: 's',
  ş: 's',
  š: 's',
  Ţ: 'T',
  Ť: 'T',
  Ŧ: 'T',
  ţ: 't',
  ť: 't',
  ŧ: 't',
  Ũ: 'U',
  Ū: 'U',
  Ŭ: 'U',
  Ů: 'U',
  Ű: 'U',
  Ų: 'U',
  ũ: 'u',
  ū: 'u',
  ŭ: 'u',
  ů: 'u',
  ű: 'u',
  ų: 'u',
  Ŵ: 'W',
  ŵ: 'w',
  Ŷ: 'Y',
  ŷ: 'y',
  Ÿ: 'Y',
  Ź: 'Z',
  Ż: 'Z',
  Ž: 'Z',
  ź: 'z',
  ż: 'z',
  ž: 'z',
  Ĳ: 'IJ',
  ĳ: 'ij',
  Œ: 'Oe',
  œ: 'oe',
  ŉ: '\'n',
  ſ: 's',
}

/**
 * Used by `deburr` to convert Latin-1 Supplement and Latin Extended-A
 * letters to basic Latin letters.
 *
 * @private
 * @param {string} letter The matched letter to deburr.
 * @returns {string} Returns the deburred letter.
 */
const deburrLetter = basePropertyOf(deburredLetters)

/** Used to match Latin Unicode letters (excluding mathematical operators). */
const reLatin = /[\xC0-\xD6\xD8-\xF6\xF8-\xFF\u0100-\u017F]/g

/** Used to compose unicode character classes. */
const rsComboMarksRange = '\\u0300-\\u036f'
const reComboHalfMarksRange = '\\ufe20-\\ufe2f'
const rsComboSymbolsRange = '\\u20d0-\\u20ff'
const rsComboMarksExtendedRange = '\\u1ab0-\\u1aff'
const rsComboMarksSupplementRange = '\\u1dc0-\\u1dff'
const rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange + rsComboMarksExtendedRange + rsComboMarksSupplementRange

/** Used to compose unicode capture groups. */
const rsCombo = `[${rsComboRange}]`

/**
 * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
 * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
 */

// eslint-disable-next-line no-misleading-character-class
const reComboMark = RegExp(rsCombo, 'g')

/**
 * Deburrs `string` by converting
 * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
 * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
 * letters to basic Latin letters and removing
 * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
 *
 * @param {string} string The string to deburr.
 * @returns {string} Returns the deburred string.
 * @example
 *
 * deburr('déjà vu')
 * // => 'deja vu'
 */
export function deburr(string: string): string {
  return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '')
}
