/*
https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript

camelCase
snake_case
kebab-case
PascalCase // I won't be using this here, but it's only one small step further if you want to use it
*/

export function toCamelCase(s: string) {
  // if only capital letters, convert to lower case
  if (s.length > 0) {
    if (/^[A-Z0-9_\- ]*$/.test(s))
      s = s.toLowerCase()

    s = s
      // strip trailing non chars
      .replace(/^[-_ ]+/g, '')
      .replace(/[-_ ]+$/g, '')
      // strip separators and upper case first char
      .replace(/[-_ ]+([a-z0-9])/gi, ($0, $1) => $1.toUpperCase())
    // lower case first char
    s = s[0].toLowerCase() + s.substring(1)
  }
  return s
}

export function toCapitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.toLowerCase().slice(1)
}

export function toCapitalizeWords(s: string) {
  return s.replace(/\w\S*/g, toCapitalize)
}

// export function camelize(str: string) {
//   return str
//     .replace(/(?:^\w|[A-Z]|\b\w)/g, (word: string, index: number) =>
//       index === 0 ? word.toLowerCase() : word.toUpperCase()
//     )
//     .replace(/\s+/g, "")
// }

export function fromCamelCase(str: string, separator = '-') {
  separator = typeof separator === 'undefined' ? '_' : separator
  return str
    .replace(/([a-z\d])([A-Z])/g, `$1${separator}$2`)
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, `$1${separator}$2`)
    .toLowerCase()
}
